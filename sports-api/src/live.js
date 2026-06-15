// Shared "fetch live events for a category" logic, used by SSE poll loop.
import * as apisports from "./clients/apisports.js";
import * as openf1 from "./clients/openf1.js";
import { normalizeGame, normalizeSession } from "./normalize.js";
import { LEAGUE_MAP } from "./config.js";

/**
 * Returns normalized live events for a category.
 * Basketball: /games?live=all filtered to the category's league.
 * F1: sessions for the current year whose status === "live".
 */
export async function fetchLiveEvents(category) {
  if (category === "f1") {
    const year = new Date().getFullYear();
    const sessions = await openf1.getSessions({ year });
    return sessions.map((s) => normalizeSession(s)).filter((e) => e.status === "live");
  }

  const leagueId = LEAGUE_MAP[category];
  if (!leagueId) return [];
  const games = await apisports.getGames({ leagueId, season: null, live: true });
  return games
    .filter((g) => g?.league?.id === leagueId)
    .map((g) => normalizeGame(g, category))
    .filter((e) => e.status === "live");
}
