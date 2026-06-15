import { Router } from "express";
import { asyncRoute } from "./_wrap.js";
import * as cache from "../cache.js";
import * as apisports from "../clients/apisports.js";
import * as openf1 from "../clients/openf1.js";
import { normalizeGame, normalizeSession } from "../normalize.js";
import { LEAGUE_MAP, currentBasketballSeason } from "../config.js";

const router = Router();

const TTL_LIVE = 20_000;
const TTL_SEASON = 5 * 60_000;
const TTL_SESSIONS = 5 * 60_000;

// F1 sessions: GET /v1/f1/sessions
router.get(
  "/f1/sessions",
  asyncRoute(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const events = await cache.getOrFetch(`f1:sessions:${year}`, TTL_SESSIONS, async () => {
      const sessions = await openf1.getSessions({ year });
      return sessions.map((s) => normalizeSession(s));
    });
    res.json({ category: "f1", count: events.length, events });
  })
);

// Basketball games: GET /v1/:category/games?status=live|upcoming|results
router.get(
  "/:category/games",
  asyncRoute(async (req, res) => {
    const { category } = req.params;
    if (category === "f1") {
      return res.status(404).json({ error: "Use /v1/f1/sessions for F1" });
    }
    const leagueId = LEAGUE_MAP[category];
    if (!leagueId) {
      return res.status(404).json({ error: `Unknown category: ${category}` });
    }

    const status = (req.query.status || "upcoming").toLowerCase();
    const season = req.query.season || currentBasketballSeason();

    let events;
    if (status === "live") {
      events = await cache.getOrFetch(`bball:live:${category}`, TTL_LIVE, async () => {
        const games = await apisports.getGames({ leagueId, season, live: true });
        return games
          .filter((g) => g?.league?.id === leagueId)
          .map((g) => normalizeGame(g, category))
          .filter((e) => e.status === "live");
      });
    } else {
      // upcoming and results both come from the season game list (single upstream call).
      const all = await cache.getOrFetch(`bball:season:${category}:${season}`, TTL_SEASON, async () => {
        const games = await apisports.getGames({ leagueId, season, live: false });
        return games.map((g) => normalizeGame(g, category));
      });
      if (status === "results") {
        events = all.filter((e) => e.status === "final");
      } else {
        events = all.filter((e) => e.status === "upcoming");
      }
    }

    res.json({ category, status, season, count: events.length, events });
  })
);

export default router;
