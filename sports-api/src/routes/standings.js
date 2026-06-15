import { Router } from "express";
import { asyncRoute } from "./_wrap.js";
import * as cache from "../cache.js";
import * as apisports from "../clients/apisports.js";
import * as jolpica from "../clients/jolpica.js";
import { normalizeStandings, normalizeDriverStandings } from "../normalize.js";
import { LEAGUE_MAP, currentBasketballSeason } from "../config.js";

const router = Router();

const TTL_STANDINGS = 8 * 60 * 60_000; // 8h

router.get(
  "/:category/standings",
  asyncRoute(async (req, res) => {
    const { category } = req.params;

    if (category === "f1") {
      const year = Number(req.query.year) || new Date().getFullYear();
      const standings = await cache.getOrFetch(`f1:standings:${year}`, TTL_STANDINGS, async () => {
        const rows = await jolpica.getDriverStandings(year);
        return normalizeDriverStandings(rows);
      });
      return res.json({ category: "f1", season: String(year), count: standings.length, standings });
    }

    const leagueId = LEAGUE_MAP[category];
    if (!leagueId) {
      return res.status(404).json({ error: `Unknown category: ${category}` });
    }

    const season = req.query.season || currentBasketballSeason();
    const standings = await cache.getOrFetch(
      `bball:standings:${category}:${season}`,
      TTL_STANDINGS,
      async () => {
        const response = await apisports.getStandings({ leagueId, season });
        return normalizeStandings(response);
      }
    );

    res.json({ category, season, count: standings.length, standings });
  })
);

export default router;
