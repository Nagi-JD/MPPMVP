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

The headline goal of this MVP is breadth of **categories** — football/soccer, esports
(LoL, CS2, Dota, Valorant), and other traditional sports — backed by a pluggable data
layer so new categories are added with a single adapter.

> **Status:** 🟡 MVP in design / early build. See the [design spec](./docs/specs/2026-06-15-mpp-plus-design.md).

## Features (MVP scope)

- 🔮 **Predictions** — pick outcomes for upcoming events before they lock.
- 🏆 **Leaderboards** — global ranking plus private-league (friends) rankings, updated live.
- 👥 **Private groups** — create or join a league via invite code.
- 🔥 **Streaks & profiles** — total points, win rate, current/best streak.
- ⚙️ **Automated settlement** — results are fetched and points awarded automatically.
- 📱 **Installable PWA** — app-like experience on phone and desktop.

**Deferred (post-MVP):** real-money / crypto wagering, chat & comments, push
notifications, native iOS. The data model leaves room for a future wallet/ledger.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js (App Router)** + TypeScript | Mobile-first PWA, fast iteration, Android-wrappable via Capacitor |
| Backend | **Supabase** (Postgres, Auth, Realtime, RLS) | Auth + live leaderboards + secure row policies with minimal backend code |
| Jobs | Supabase Edge Functions (cron) | Fixture sync + idempotent settlement |
| Data | football-data.org · PandaScore · TheSportsDB | Free-tier event/result feeds, one adapter per category |

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

- [ ] Project scaffold (Next.js + Supabase client + PWA manifest)
- [ ] Database schema & RLS policies
- [ ] Auth + onboarding (pick favorite categories)
- [ ] Event feed + prediction flow (server-enforced lock time)
- [ ] Category adapters: football → esports → other sports
- [ ] Settlement job (idempotent scoring + streaks)
- [ ] Global & group leaderboards (Realtime)
- [ ] PWA polish + Android (Capacitor) packaging

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Issues and PRs are welcome.

## License

[MIT](./LICENSE) © Nagi-JD
