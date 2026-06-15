<div align="center">

# MPP+ — The Social Predictor

**A free-to-play social prediction game.** Predict the outcome of football, esports, and sports events, build streaks, and climb global and private-league leaderboards — no real-money gambling.

[![CI](https://github.com/Nagi-JD/MPPMVP/actions/workflows/ci.yml/badge.svg)](https://github.com/Nagi-JD/MPPMVP/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](https://web.dev/progressive-web-apps/)

</div>

---

## Overview

MPP+ is a mobile-first Progressive Web App where players predict real-world event
outcomes and earn virtual points. It is a social game, not a betting platform: there
is **no real-money wagering** in the MVP. The product is designed phone-first and can
be packaged as a native Android app without a rewrite.

The MVP launches with real leagues — **NBA, EuroLeague, LNB France (basketball)** and
**Formula 1** — each with sport-specific prediction markets, its own colour and validation
animation, and a **per-season ranking** (NBA 2026, F1 2026, …). Rank rewards accuracy ×
volume × difficulty. A **Rewards** section (badges, seasonal prizes, premium) is scaffolded.

> **Status:** 🟢 Playable web prototype (mock data). Production target — React Native/Expo
> + NestJS/FastAPI + Postgres/Redis — is documented in
> [docs/PRODUCTION-ARCHITECTURE.md](./docs/PRODUCTION-ARCHITECTURE.md).

## Features (MVP scope)

- 🏀🏎️ **Sport-specific markets** — Basketball: match winner, exact score, top scorer, season
  champion. F1: qualifying/sprint/race podium, fastest lap, top speed, best sectors, drivers'
  & constructors' champion.
- 🎬 **Onboarding** — pick favourite sports in a popup; the dashboard adapts.
- 🏆 **Seasonal ranking** — a separate leaderboard per league/season, rank tier from accuracy
  × volume × difficulty.
- 👥 **Private mini-leagues** — create or join with an invite code.
- 🎨 **Per-sport identity** — distinct colour + validation animation (basketball bounce, F1
  speed-sweep) and original sport marks.
- 🏅 **Rewards (preview)** — badges, seasonal prizes, premium — scaffolded for later.
- 📱 **Installable PWA** — app-like experience; native app is the production target.

**Deferred:** real-money wagering (never — this is a social game), chat, push, live rewards.

## Tech Stack

**Prototype (this repo):** Next.js (App Router) + TypeScript + Tailwind, Zustand, Vitest,
PWA. Data behind a `DataProvider` interface with an in-memory mock provider (runs with zero
setup).

**Production target:** React Native/Expo (gluestack-ui) · NestJS or FastAPI · PostgreSQL ·
Redis · cron workers. Sport feeds: OpenF1 / Jolpica-F1 / FastF1, nba_api / balldontlie,
euroleague_api, API-SPORTS / Highlightly. See
[docs/PRODUCTION-ARCHITECTURE.md](./docs/PRODUCTION-ARCHITECTURE.md).

## Architecture

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────────┐
│  Next.js PWA │────▶│   Supabase (API)    │◀────│  Edge Functions   │
│  (mobile UI) │     │  Postgres + Auth    │     │  sync · settle    │
└──────────────┘     │  Realtime + RLS     │     └────────┬─────────┘
        ▲            └────────────────────┘              │ free APIs
        │ live leaderboard (Realtime)                    ▼
        └───────────────────────────────────────  category adapters
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the data model and flows.

## Getting Started

> The application scaffold lands during implementation. These steps describe the
> intended developer workflow.

```bash
# 1. Clone
git clone https://github.com/Nagi-JD/MPPMVP.git && cd MPPMVP

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local   # fill in Supabase + API keys

# 4. Run
npm run dev                  # http://localhost:3000
```

### Requirements

- Node.js `>= 20` (see [`.nvmrc`](./.nvmrc))
- A free [Supabase](https://supabase.com/) project
- Free API keys for the categories you enable (see `.env.example`)

## Roadmap

- [x] Project scaffold (Next.js + Tailwind + Vitest + PWA manifest)
- [x] Event feed + prediction flow (one pick per event)
- [x] Pure, tested scoring + streak logic
- [x] Pluggable data layer (mock provider; Supabase provider next)
- [x] Category adapters: football, esports, other sports
- [x] Global leaderboard + private groups (mock provider)
- [x] Database schema & RLS policies (`supabase/schema.sql`)
- [ ] Supabase provider + Auth + onboarding (pick favorite categories)
- [ ] Settlement cron job wired to Supabase + Realtime
- [ ] PWA polish + Android (Capacitor) packaging

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Issues and PRs are welcome.

## License

[MIT](./LICENSE) © Nagi-JD
