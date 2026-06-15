# Mobile Frontend Port — Design

**Date:** 2026-06-15
**Status:** Approved
**Goal:** Port the MPP+ Next.js web frontend (`src/`) to the Expo/React Native mobile app (`mobile/`) at full parity: all 5 pages, bottom-tab navigation, and onboarding — wired to the FastAPI backend where endpoints exist, with local fallbacks for the gaps.

---

## Decisions (locked)

| Question | Decision |
|----------|----------|
| Scope | All 5 pages (Home, Leagues, Leaderboard, Rewards, Profile) + bottom nav + onboarding |
| Data source | FastAPI backend for covered endpoints; local fallback for uncovered features |
| Components | Reuse + extend the existing themed components in `mobile/src/components` |
| Navigation | `expo-router` (already installed) |
| API base URL | Env-configured (`EXPO_PUBLIC_API_URL`) with per-platform defaults; CORS added to backend |

---

## Current state

- **Web (`src/`)** — full Next.js app: routes `page.tsx` (Home), `leaderboard`, `leagues`, `profile`, `rewards`; `BottomNav`; `OnboardingModal`; data layer (`lib/data/provider.ts` interface, `mock.ts`, `client.ts`), `lib/{types,catalog,scoring,time}.ts`; `store/useSession.ts` (zustand + localStorage persist).
- **Mobile (`mobile/`)** — single hard-coded demo screen (`App.tsx`) with good themed components (`EventCard`, `PredictionCard`, `PredictionButton`, `LeaderboardRow`, `ResultCard`, `RewardCard`, `LeagueCard`, `SportHeader`, `SeasonProgressBar`, `RankBadge`, `SportCard`), a theme system (`theme/sportThemes`, `useSportTheme`, `fonts`, `shadow`), and `types.ts`. `expo-router` is installed but unused (`main` = `index.ts` → `App.tsx`).

## Backend contract (mounted at root, snake_case JSON)

- `GET /health`
- `GET /leagues` → `LeagueOut[]`
- `GET /leagues/{id}/board` → `BoardOut { league, fixtures[] }` (each fixture: `id`, `league_id`, `name`, `start_time`, `markets[]`; market: `id`, `fixture_id`, `kind`, `label`, `input`, `difficulty`, `scope`, `lock_time`, `status`, `result`, `options`)
- `GET /leagues/{id}/leaderboard` → `LeaderboardRow[]` (`user_id`, `points`, `made`, `accuracy`, `tier` — **no display name**)
- `GET /users/{userId}/seasons/{leagueId}` → `SeasonStatsOut`
- `POST /predictions` `{user_id, market_id, value}` → `PredictionOut`
- `POST /markets/{id}/settle`

### Gaps vs. web `DataProvider`
1. No "get my predictions" endpoint (Home needs locked-pick state).
2. No profile endpoint.
3. No rewards endpoint.
4. No groups (`createGroup`/`joinGroup`).
5. Leaderboard rows lack display names.
6. Fixture shape is thinner than web (`name`/`start_time` only; no `home/away/venue/scope/status/lockTime`).
7. No CORS middleware.

---

## Architecture

```
mobile/
  app/                          # expo-router file routes ≈ web routes
    _layout.tsx                 # fonts + SportThemeProvider + onboarding gate + floodlight bg
    (tabs)/_layout.tsx          # bottom tab bar, themed by active sport
    (tabs)/index.tsx            # Home   (= web app/page.tsx)
    (tabs)/leagues.tsx          # Leagues
    (tabs)/leaderboard.tsx      # Leaderboard
    (tabs)/rewards.tsx          # Rewards
    (tabs)/profile.tsx          # Profile
  src/
    lib/
      types.ts                  # ported from web src/lib/types.ts
      catalog.ts                # ported; Tailwind tokens → theme values
      scoring.ts                # ported verbatim (pure TS)
      time.ts                   # ported verbatim
      data/
        provider.ts             # DataProvider interface (same shape as web)
        http.ts                 # fetch client, base-URL resolver, snake↔camel mapping, typed errors
        backendProvider.ts      # implements DataProvider over FastAPI + local fallbacks
        client.ts               # getProvider() singleton
    store/
      useSession.ts             # zustand + AsyncStorage persist
    components/                 # existing themed components, extended as needed
      OnboardingModal.tsx       # new RN modal port
```

`App.tsx` / `index.ts` entry is replaced by expo-router's entry (`main` → `expo-router/entry`).

## Data layer

- `DataProvider` interface identical to web so screens port near 1:1.
- `backendProvider.ts`:
  - **Real API:** `listLeagues`, `getBoard`, `leaderboard`, `seasonStats`, `submitPrediction`, `settleMarket`.
  - **Adapter:** maps backend snake_case + thin `FixtureOut` into web `Fixture`/`Market` shapes (derive `home`/`away` by splitting `name` on " vs ", carry `scope`/`status`/`lockTime` from markets, map `start_time`→`startTime`).
  - **Local fallbacks:**
    - `getPredictions` → AsyncStorage cache, written on every `submitPrediction`.
    - `getProfile` → derived from season stats + session `displayName`.
    - Rewards → static badge catalog in `lib/catalog.ts`; unlocked state derived from stats.
    - `createGroup`/`joinGroup` → local stub with generated invite code.
    - Leaderboard names → `user_id` (self shown as "You") until backend adds names.
- `http.ts`: base URL from `process.env.EXPO_PUBLIC_API_URL`, default `http://localhost:8000`; auto-rewrite to `http://10.0.2.2:8000` on Android. Typed errors; screens render loading/empty/error states (mirroring web's "No fixtures yet").

## Navigation & screens

- expo-router `(tabs)` group → 5 native tabs, tab bar styled with the active sport theme.
- Each screen ports its web page: same `getProvider()` calls + `useSession` state, rendered via existing RN components. Home keeps the league-chip selector, season-stat banner, and animated fixtures list.
- `OnboardingModal` gates first launch (favorites → `completeOnboarding`).

## Backend change (minimal)

- Add `CORSMiddleware` to `backend/app/main.py` (permissive in debug) so Expo web/devices can call the API. No new endpoints — gaps handled client-side.

## Out of scope (YAGNI)

- No new backend endpoints, no Supabase, no real auth (demo identity stays).
- No rebuild of existing components that already fit.

## Verification

- `cd mobile && npm run typecheck` passes.
- App boots in Expo (web target); all 5 tabs render.
- With `uvicorn` running, Home loads leagues/board from the API; submitting a prediction round-trips and shows as locked.
- Onboarding appears on first launch and persists choice across reloads.

## Build assist

Use the newly added `wshobson/agents` plugin agents (React Native / frontend / API-integration specialists) to accelerate component porting and screen construction during implementation.
