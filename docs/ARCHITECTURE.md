# Architecture

MPP+ is a mobile-first PWA backed by Supabase. This document describes the system
components, data model, and core flows. For the product rationale and scope, see the
[design spec](./specs/2026-06-15-mpp-plus-design.md).

## Components

| Component | Responsibility |
|-----------|----------------|
| **Next.js PWA** | Mobile-first UI, auth session, prediction & leaderboard screens. Installable. |
| **Supabase Postgres** | System of record. Row-Level Security enforces who can read/write what. |
| **Supabase Auth** | Email + OAuth (Google). Issues the session used by the client and RLS. |
| **Supabase Realtime** | Pushes leaderboard/prediction changes to clients live. |
| **Edge Function: sync** | Cron job; pulls upcoming events per category via adapters. |
| **Edge Function: settle** | Cron job; fetches results for finished events, awards points, updates streaks. Idempotent. |
| **Category adapters** | One per source; map an external API's shape into our `events` schema. |

## Data Model

```
profiles                categories            events
─────────               ──────────            ──────
id (=auth uid)          id                    id
display_name            slug (football…)      external_id
avatar_url              name                  category_id  ─┐ FK
total_points            enabled               title          │
current_streak                                competitors    │ (jsonb)
best_streak                                   start_time      │
                                              lock_time       │
predictions                                   status          │  (scheduled|locked|settled)
───────────                                   result          │
id                                            settled_at      │
user_id   ── FK profiles                                      │
event_id  ── FK events ───────────────────────────────────────┘
choice
points_awarded
settled (bool)
UNIQUE(user_id, event_id)

groups                  group_members
──────                  ─────────────
id                      group_id ── FK groups
name                    user_id  ── FK profiles
invite_code (unique)    role (owner|member)
owner_id ── FK profiles UNIQUE(group_id, user_id)
```

### Reserved for later (NOT in MVP)

A future `wallets` + `ledger` pair slots in alongside `profiles` without altering
existing tables, enabling a real-money/crypto layer post-MVP.

## Core Flows

### Prediction
1. Client reads `events` where `status = 'scheduled'` and `lock_time > now()`.
2. User submits a `prediction`. RLS + a DB check reject inserts/updates once
   `lock_time` has passed — **late picks are impossible server-side**.

### Settlement (cron)
1. `settle` selects events where `start_time < now()` and `status != 'settled'`.
2. For each, the category adapter fetches the result.
3. If final: set `events.result` + `status='settled'`; for each prediction, compute
   `points_awarded` and update the user's `total_points` and streak.
4. **Idempotency:** keyed on `predictions.settled` and `events.settled_at` — re-running
   never double-awards.

### Leaderboards
- Global: order `profiles` by `total_points`.
- Group: join `group_members` → `profiles`.
- Both subscribe to Realtime for live updates.

## Adding a Category

1. Add a row to `categories` (`slug`, `name`, `enabled`).
2. Implement an adapter exposing `fetchUpcoming()` and `fetchResult(event)`.
3. Register the adapter in the sync/settle dispatch map.

No schema or UI changes required — the feed and prediction flow are category-agnostic.

## Testing Strategy

- **Unit:** scoring & settlement are pure functions tested against seeded fixtures.
- **Idempotency:** settlement re-run test asserts points are awarded exactly once.
- **Manual admin path:** inject a test event + result to exercise the full loop without
  waiting on real fixtures.
