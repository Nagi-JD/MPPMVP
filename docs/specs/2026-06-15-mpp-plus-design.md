# MPP+ — The Social Predictor (MVP Design)

- **Date:** 2026-06-15
- **Status:** Approved (design); pre-implementation
- **Author:** Nagi-JD

## Summary

MPP+ is a free-to-play social prediction game inspired by *MPP — The Social Predictor*,
expanded with more **categories** (notably esports). Players predict outcomes of real
events, earn virtual points, build streaks, and compete on global and private-league
leaderboards. There is **no real-money wagering** in the MVP, though the architecture
leaves room to add a wallet/ledger later.

## Goals

- Validate the idea as a working **MVP / prototype**.
- Ship **phone-first**: a mobile-friendly, installable PWA now; Android (Capacitor) later
  with no rewrite.
- Launch with breadth of categories: **football/soccer, esports, other traditional sports**.
- Use **real fixtures** from free public APIs.
- Make adding a new category cheap (one adapter + one row).

## Non-Goals (MVP)

- Real-money or crypto wagering.
- Chat / comments.
- Push notifications.
- Native iOS.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Goal | Prototype / MVP | Validate before investing further |
| Platform | Mobile-first PWA, Android later | Fast to build & test; phone-first vision preserved |
| Money model | Points only, money-ready schema | No gambling/legal scope now; extensible later |
| Event data | Real, from free public APIs | Realistic predictions; adapter layer per category |
| Categories | Football, Esports, Other sports | Headline breadth; esports is the new draw |
| Social | Global leaderboard + friends/private groups + profiles/streaks | Core social loop without moderation burden |
| Stack | Next.js (PWA) + Supabase | Least effort for auth, realtime, secure data, Postgres for future ledger |

## Architecture & Data Model

See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for components, tables, and flows. In brief:

- **Frontend:** Next.js App Router, TypeScript, PWA.
- **Backend:** Supabase — Postgres + Auth + Realtime + Row-Level Security.
- **Jobs:** two cron edge functions — *fixture sync* and *idempotent settlement*.
- **Data sources:** football-data.org, PandaScore (esports), TheSportsDB.

## Key User Flows

1. **Onboard:** sign up → pick favorite categories.
2. **Predict:** browse upcoming events → submit a pick before `lock_time`
   (server-enforced).
3. **Settle:** finished events auto-settle → points + streaks update.
4. **Compete:** global leaderboard + create/join private groups via invite code.

## Fairness & Error Handling

- Predictions locked at `lock_time` at the database level — no late picks.
- Settlement is idempotent — re-runs never double-award.
- API failures retry on the next cron run; unresolved events remain `pending`.

## Testing

- Unit tests on scoring/settlement (pure functions, seeded fixtures).
- Idempotency test for settlement.
- Admin path to inject a test event + result for full-loop testing.

## Roadmap

1. Scaffold (Next.js + Supabase client + PWA manifest)
2. Schema + RLS
3. Auth + onboarding
4. Event feed + prediction flow
5. Category adapters (football → esports → other)
6. Settlement job
7. Leaderboards (global + group, Realtime)
8. PWA polish + Android packaging

## Open Questions

- Final app name (working title: **MPP+**).
- Scoring rule: flat points per correct pick vs. difficulty/odds-weighted. (MVP default:
  flat points + streak bonus.)
