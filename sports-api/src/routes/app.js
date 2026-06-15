// Mobile "app" prediction API, mounted at /v1/app.

import { Router } from "express";
import { asyncRoute } from "./_wrap.js";
import { listLeagues, getLeague } from "../predict/leagues.js";
import { getBoard, findMarketById } from "../predict/markets.js";
import * as store from "../predict/store.js";
import {
  getPredictions,
  seasonStats,
  leaderboard,
  profile,
  resolvePrediction,
} from "../predict/settle.js";

const router = Router();

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
