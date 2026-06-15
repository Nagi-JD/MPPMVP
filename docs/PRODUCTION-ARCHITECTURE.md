# Production Target Architecture

The current repo is a **runnable web prototype** (Next.js PWA, mock data) that validates
gameplay and UX. This document captures the **production stack** to build once the UX is
validated. Nothing in the prototype is wasted: the domain model, scoring/rank logic, and
screen flows port directly.

> Decision (2026-06-15): keep the web prototype for fast iteration; build the native app
> and backend below for production. See `docs/specs/`.

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Mobile app | **React Native + Expo** | The shipped phone app. UI components via **gluestack-ui** (RN). |
| Web (optional) | Next.js + **HeroUI** | The current prototype can graduate to a companion web client. |
| Backend API | **NestJS** (Node) or **FastAPI** (Python) | REST/GraphQL; owns auth, predictions, settlement, rank. |
| Database | **PostgreSQL** | System of record (leagues, fixtures, markets, predictions, season stats). |
| Cache | **Redis** | Live scores, leaderboards, hot fixtures. |
| Jobs | **Cron workers** | Calendar sync + result settlement per sport. |

## Per-sport data sources

| Sport / League | API |
|----------------|-----|
| F1 (live timing, results) | **OpenF1** |
| F1 (schedule, classifications) | **Jolpica-F1** (Ergast successor) |
| F1 (advanced calcs: sectors, top speed, fastest lap) | **FastF1** (Python) |
| NBA | **nba_api** or **balldontlie** |
| EuroLeague | **euroleague_api** |
| LNB France | **API-SPORTS Basketball** or **Highlightly** |

FastF1 is Python-only — a strong reason to run the F1 settlement worker in Python even if
the main API is NestJS. Workers can be polyglot behind the same Postgres/Redis.

## Settlement & rank (ports from the prototype)

- `src/lib/scoring.ts` → backend service: `scoreMarket` (choice/score/podium, difficulty-weighted)
  and `rankTier` (accuracy × volume) move verbatim.
- Each sport has a **settlement adapter** that maps an external API's result into a market
  `result` string, mirroring the prototype's `Market` shape.
- Per-sport, per-season leaderboards are Redis sorted sets keyed `lb:{leagueId}`, rebuilt by
  the settlement worker; Postgres remains the source of truth.

## Per-sport identity

Each sport carries its own color + validation animation (basketball: amber + bounce;
F1: magenta/red + speed-sweep) — see `src/lib/catalog.ts`. In RN, gluestack themes + Reanimated
reproduce these. Sport marks live in `src/components/SportLogo.tsx` (original, not trademarked).

## Tooling MCP servers (optional)

- **gluestack MCP** (`github.com/gluestack/mcp`) — RN component scaffolding for the Expo app.
- **HeroUI MCP** (`heroui.com/docs/react/migration/mcp-server`) — web component scaffolding.

These can be wired into the dev environment when the native build starts.
