import { Router } from "express";
import { asyncRoute } from "./_wrap.js";
import * as cache from "../cache.js";
import * as apisports from "../clients/apisports.js";
import * as openf1 from "../clients/openf1.js";
import { normalizeGame, normalizeSession, deriveSessionResults } from "../normalize.js";
import { LEAGUE_MAP } from "../config.js";

const router = Router();

const TTL_LIVE_GAME = 20_000;
const TTL_LIVE_SESSION = 8_000;

// GET /v1/:category/events/:id
router.get(
  "/:category/events/:id",
  asyncRoute(async (req, res) => {
    const { category, id } = req.params;

    if (category === "f1") {
      const cacheKey = `f1:event:${id}`;
      // If a finished session detail was stored permanently, serve it.
      const permanent = cache.get(cacheKey);
      if (permanent !== undefined) return res.json(permanent);

      const [sessions, drivers, positions, raceControl, laps] = await Promise.all([
        openf1.getSessions({ year: new Date().getFullYear() }),
        openf1.getDrivers(id),
        openf1.getPositions(id),
        openf1.getRaceControl(id),
        openf1.getLaps(id),
      ]);

      let session = sessions.find((s) => String(s.session_key) === String(id));
      // session may belong to a previous year; fall back to fetching its year is omitted (Phase 1)
      const event = session ? normalizeSession(session) : { id: String(id), category: "f1", kind: "session" };

      const results = deriveSessionResults(drivers, positions);
      // Recent laps: last 50 by date for compactness.
      const recentLaps = [...laps]
        .sort((a, b) => (a.date_start || "").localeCompare(b.date_start || ""))
        .slice(-50);

      const detail = {
        event,
        results,
        raceControl: raceControl.slice(-30),
        recentLaps,
      };

      if (event.status === "final") {
        cache.setPermanent(cacheKey, detail);
      }
      return res.json(detail);
    }

    // Basketball detail (box score) via getGameById.
    if (!LEAGUE_MAP[category]) {
      return res.status(404).json({ error: `Unknown category: ${category}` });
    }

    const permKey = `bball:event:${id}`;
    const cached = cache.get(permKey);
    if (cached !== undefined) return res.json(cached);

    const detail = await cache.getOrFetch(`bball:event:fetch:${id}`, TTL_LIVE_GAME, async () => {
      const arr = await apisports.getGameById(id);
      if (!arr.length) {
        const e = new Error(`Game not found: ${id}`);
        e.notFound = true;
        throw e;
      }
      return normalizeGame(arr[0], category);
    });

    // Permanently store finalized games keyed by event id so detail never re-fetches.
    if (detail.status === "final") {
      cache.setPermanent(permKey, detail);
    }

    res.json(detail);
  })
);

export default router;
