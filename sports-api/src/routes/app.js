// Mobile "app" prediction API, mounted at /v1/app.

import { Router } from "express";
import { asyncRoute } from "./_wrap.js";
import { listLeagues, getLeague, apiSportsSeasonString } from "../predict/leagues.js";
import { getBoard, findMarketById } from "../predict/markets.js";
import * as store from "../predict/store.js";
import * as cache from "../cache.js";
import * as apisports from "../clients/apisports.js";
import * as jolpica from "../clients/jolpica.js";
import { normalizeStandings, normalizeDriverStandings } from "../normalize.js";
import { LEAGUE_MAP } from "../config.js";
import {
  getPredictions,
  seasonStats,
  leaderboard,
  profile,
  resolvePrediction,
} from "../predict/settle.js";

const router = Router();

const TTL_TEAMS = 8 * 60 * 60_000; // 8h — team rosters change rarely

// GET /v1/app/leagues -> League[]
router.get(
  "/app/leagues",
  asyncRoute(async (_req, res) => {
    res.json(listLeagues());
  })
);

// GET /v1/app/leagues/:id/board -> FixtureBoard[]
router.get(
  "/app/leagues/:id/board",
  asyncRoute(async (req, res) => {
    const { id } = req.params;
    if (!getLeague(id)) {
      return res.status(404).json({ error: `Unknown league: ${id}` });
    }
    res.json(await getBoard(id));
  })
);

// GET /v1/app/leagues/:id/teams -> { name }[]
// Followable teams for a league: basketball = standings team names; F1 =
// constructor names from the driver standings. Real upstream data, cached 8h.
router.get(
  "/app/leagues/:id/teams",
  asyncRoute(async (req, res) => {
    const { id } = req.params;
    const league = getLeague(id);
    if (!league) return res.status(404).json({ error: `Unknown league: ${id}` });

    if (id === "f1") {
      const year = Number(req.query.year) || new Date().getFullYear();
      const teams = await cache.getOrFetch(`app:teams:f1:${year}`, TTL_TEAMS, async () => {
        const rows = normalizeDriverStandings(await jolpica.getDriverStandings(year));
        const names = [...new Set(rows.map((r) => r?.extra?.constructor).filter(Boolean))];
        return names.map((name) => ({ name }));
      });
      return res.json(teams);
    }

    const apiLeagueId = LEAGUE_MAP[id];
    if (!apiLeagueId) return res.json([]);
    const season = apiSportsSeasonString(league.season);
    const teams = await cache.getOrFetch(`app:teams:${id}:${season}`, TTL_TEAMS, async () => {
      const rows = normalizeStandings(await apisports.getStandings({ leagueId: apiLeagueId, season }));
      const names = [...new Set(rows.map((r) => r?.name).filter(Boolean))].sort();
      return names.map((name) => ({ name }));
    });
    res.json(teams);
  })
);

// GET /v1/app/predictions?userId= -> Prediction[]
router.get(
  "/app/predictions",
  asyncRoute(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query param required" });
    res.json(await getPredictions(String(userId)));
  })
);

// POST /v1/app/predictions {userId, marketId, value} -> Prediction (409 if closed/unknown)
router.post(
  "/app/predictions",
  asyncRoute(async (req, res) => {
    const { userId, marketId, value } = req.body || {};
    if (!userId || !marketId || value == null) {
      return res.status(400).json({ error: "userId, marketId and value are required" });
    }

    const market = await findMarketById(marketId);
    if (!market) {
      return res.status(409).json({ error: `Unknown market: ${marketId}` });
    }

    // Accept only if market is still open: status !== settled AND lockTime > now.
    const now = Date.now();
    const lockMs = market.lockTime ? new Date(market.lockTime).getTime() : NaN;
    const open = market.status !== "settled" && Number.isFinite(lockMs) && lockMs > now;
    if (!open) {
      return res
        .status(409)
        .json({ error: `Market closed for predictions: ${marketId}`, status: market.status });
    }

    const record = await store.upsert({ userId: String(userId), marketId, value });
    res.json(resolvePrediction(record, market));
  })
);

// GET /v1/app/users/:userId/seasons/:leagueId -> SeasonStats
router.get(
  "/app/users/:userId/seasons/:leagueId",
  asyncRoute(async (req, res) => {
    const { userId, leagueId } = req.params;
    if (!getLeague(leagueId)) {
      return res.status(404).json({ error: `Unknown league: ${leagueId}` });
    }
    res.json(await seasonStats(userId, leagueId));
  })
);

// GET /v1/app/leagues/:id/leaderboard -> LeaderboardRow[]
router.get(
  "/app/leagues/:id/leaderboard",
  asyncRoute(async (req, res) => {
    const { id } = req.params;
    if (!getLeague(id)) {
      return res.status(404).json({ error: `Unknown league: ${id}` });
    }
    res.json(await leaderboard(id));
  })
);

// GET /v1/app/users/:userId/profile -> Profile
router.get(
  "/app/users/:userId/profile",
  asyncRoute(async (req, res) => {
    const { userId } = req.params;
    res.json(await profile(userId));
  })
);

export default router;
