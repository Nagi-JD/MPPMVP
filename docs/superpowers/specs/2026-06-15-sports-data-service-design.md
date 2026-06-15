# Sports Data Service (Node/Express proxy) — Design

**Date:** 2026-06-15
**Goal:** A standalone Node/Express service that proxies real sports data (API-SPORTS basketball + OpenF1) behind hidden keys, caches per freshness rules, normalizes to one model, and pushes live updates over SSE. Mobile consumes it; later, predictions settle against its real results.

## Decisions
- Separate Node/Express service (`sports-api/`), alongside the Python FastAPI prediction backend.
- Sources: **API-SPORTS basketball** (NBA `12`, EuroLeague `120`, LNB France/Betclic Élite `2`; seasons like `2025-2026`) + **OpenF1** (F1, free/no key). Driver championship standings are NOT in OpenF1 → use jolpica-f1 (Ergast successor) or compute; flagged.
- Keys in gitignored `.env` (`APISPORTS_KEY`). Mobile never calls paid APIs directly.
- Cache: live games 15–30s, finished games permanent, standings 6–12h, F1 live sessions 5–10s.
- Realtime: **SSE** backend→mobile.
- v1 scope target: real-data display (live/upcoming/results/standings/detail per category) **and** predictions wired to real fixtures/results (phased — display first).

## Normalized model
- `Category`: `nba | lnb | euroleague | f1`.
- `Event` (game or F1 session): `{ id, category, kind: "game"|"session", status: "upcoming"|"live"|"final", startTime, name, home?, away?, score?, detail?: {...}, raw? }`.
- `StandingRow`: `{ rank, name, played, won, lost, points, extra }`.
- F1 session results: `{ position, driver, team, time/gap, points? }`.

## Endpoints (Phase 1)
- `GET /health`
- `GET /v1/categories`
- `GET /v1/:category/games?status=live|upcoming|results` (basketball) / `GET /v1/f1/sessions`
- `GET /v1/:category/events/:id` (detail: box score / session results, race control, laps when available)
- `GET /v1/:category/standings`
- `GET /v1/stream?category=:c` (SSE): server polls upstream at the category's live cadence and pushes `event: update` with changed live events.

## Architecture (`sports-api/`)
```
sports-api/
  .env (gitignored)  .env.example  .gitignore
  package.json
  src/
    config.js          # env + league/season maps
    cache.js           # TTL cache + permanent entries; getOrFetch(key, ttl, fn)
    clients/
      apisports.js     # basketball: games/standings/teams (x-apisports-key)
      openf1.js        # sessions/results/drivers/race_control/laps
    normalize.js       # upstream -> normalized model
    sse.js             # SSE hub: subscribe, broadcast; poll loop per category
    routes/
      index.js  categories.js  games.js  standings.js  events.js  stream.js
    server.js          # express app, cors(env), routes, start
```

## Caching rules (cache.js)
- key by (category, resource, params). TTL: live=20s, standings=8h, F1 live=8s.
- A finished game/session is cached permanently (no TTL) once status === final.
- Respect API-SPORTS 100 req/day: never fetch upstream on a cache hit; SSE poll loop is the only background fetcher and only runs while there is ≥1 SSE subscriber AND there are live events.

## Phasing
- **P1 (this service):** scaffold + clients + cache + REST endpoints + SSE, verified against real OpenF1 + one API-SPORTS call.
- **P2 (mobile):** category browse screens (live/upcoming/results/standings) + detail pages consuming this service via an env base URL; SSE client for live.
- **P3 (predictions):** prediction markets generated from real upcoming events; auto-settlement from real final results (bridge between this service and the FastAPI prediction domain).

## Verification (P1)
- `npm install` then `node src/server.js` boots on PORT.
- `GET /health` → ok. `GET /v1/f1/sessions` returns real OpenF1 sessions. One `GET /v1/nba/standings` (or games) returns real API-SPORTS data. SSE endpoint streams.
- `.env` confirmed gitignored; no key in committed code.
