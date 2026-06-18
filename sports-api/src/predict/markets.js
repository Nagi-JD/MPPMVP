// Board derivation: build FixtureBoard[] over REAL upstream data.
// F1 = full prediction loop (OpenF1). basketball = real settled display (API-SPORTS).

import * as cache from "../cache.js";
import * as openf1 from "../clients/openf1.js";
import * as apisports from "../clients/apisports.js";
import { deriveSessionResults } from "../normalize.js";
import { getLeague, apiSportsSeasonString } from "./leagues.js";
import { LEAGUE_MAP } from "../config.js";

const TTL_F1_BOARD = 60_000; // 1 min
const TTL_BBALL_BOARD = 6 * 60 * 60 * 1000; // 6h (historical, quota-conscious)
const TTL_F1_RESULT = 24 * 60 * 60 * 1000; // results don't change once final
const TTL_BBALL_PLAYERS = 24 * 60 * 60 * 1000; // 24h — box scores immutable for final games

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Winning-margin buckets for the "point spread" market (~5-point bands).
const MARGIN_BUCKETS = ["1-5", "6-10", "11-15", "16-20", "21+"];
function marginBucket(margin) {
  if (margin <= 5) return "1-5";
  if (margin <= 10) return "6-10";
  if (margin <= 15) return "11-15";
  if (margin <= 20) return "16-20";
  return "21+";
}

/**
 * Fixture status from a session/now.
 *  - upcoming -> "scheduled"
 *  - final    -> "settled"
 *  - else (started, not final) -> "locked"
 */
function f1FixtureStatus(session, now, isFinal) {
  const start = session?.date_start ? new Date(session.date_start) : null;
  if (start && now < start) return "scheduled";
  if (isFinal) return "settled";
  return "locked";
}

/**
 * Determine whether a session is "final" (results exist & race is over).
 * We treat a Race session as final if it has ended (date_end < now) AND we can
 * derive a P1 from the position stream.
 */
function sessionEnded(session, now) {
  const end = session?.date_end ? new Date(session.date_end) : null;
  return !!(end && now > end);
}

/**
 * Build F1 board. Returns FixtureBoard[].
 */
export async function getF1Board() {
  return cache.getOrFetch("predict:board:f1", TTL_F1_BOARD, async () => {
    const now = new Date();
    const year = now.getFullYear();

    // Fetch sessions for current year; if none yet (early in year), fall back to previous year.
    let sessions = await cache.getOrFetch(`predict:f1:sessions:${year}`, TTL_F1_BOARD, () =>
      openf1.getSessions({ year })
    );
    let usedYear = year;
    if (!sessions.some((s) => s.session_name === "Race")) {
      usedYear = year - 1;
      sessions = await cache.getOrFetch(`predict:f1:sessions:${usedYear}`, TTL_F1_RESULT, () =>
        openf1.getSessions({ year: usedYear })
      );
    }

    const races = sessions
      .filter((s) => s.session_name === "Race")
      .sort((a, b) => (a.date_start || "").localeCompare(b.date_start || ""));

    // Most recent ~6 completed/ongoing races + any upcoming ones.
    const upcoming = races.filter((s) => new Date(s.date_start) > now);
    const past = races.filter((s) => new Date(s.date_start) <= now).slice(-6);
    const selected = [...past, ...upcoming];

    // Most recent completed session's drivers as a fallback (options for upcoming
    // sessions, and for any session whose own driver fetch is rate-limited).
    let fallbackDrivers = null;
    const lastPast = past[past.length - 1];
    if (lastPast) {
      try {
        const fd = await cache.getOrFetch(
          `predict:f1:drivers:${lastPast.session_key}`,
          TTL_F1_RESULT,
          () => openf1.getDrivers(lastPast.session_key)
        );
        fallbackDrivers = driverNames(fd);
      } catch {
        fallbackDrivers = null;
      }
    }

    const boards = [];
    for (const session of selected) {
      const sk = session.session_key;
      const isFinal = sessionEnded(session, now);

      // Drivers for this session (options). Resilient to OpenF1 rate limits:
      // on failure, fall back to the most recent completed session's drivers.
      let drivers = [];
      const cachedDrivers = cache.get(`predict:f1:drivers:${sk}`);
      if (cachedDrivers !== undefined) {
        drivers = cachedDrivers;
      } else {
        try {
          await sleep(250); // gentle pacing to respect OpenF1 rate limit
          drivers = await cache.getOrFetch(
            `predict:f1:drivers:${sk}`,
            TTL_F1_RESULT,
            () => openf1.getDrivers(sk)
          );
        } catch {
          drivers = [];
        }
      }
      let options = driverNames(drivers);
      if (options.length === 0 && fallbackDrivers) options = fallbackDrivers;

      // Results when final.
      let winner = null;
      let podium = null;
      if (isFinal) {
        try {
          const results = await cache.getOrFetch(
            `predict:f1:results:${sk}`,
            TTL_F1_RESULT,
            async () => {
              await sleep(250);
              const positions = await openf1.getPositions(sk);
              return deriveSessionResults(drivers, positions);
            }
          );
          if (results.length > 0) {
            winner = results[0].driver;
            podium = results.slice(0, 3).map((r) => r.driver).join(",");
          }
        } catch {
          // Position stream unavailable (OpenF1 404/429 for some sessions).
          // Degrade gracefully: no result yet -> fixture stays "locked", not "settled".
          winner = null;
          podium = null;
        }
      }

      // A fixture is only "settled" once we actually have a result.
      const fixtureStatus = f1FixtureStatus(session, now, isFinal && winner != null);
      const startTime = session.date_start || null;
      const lockTime = startTime; // predictions lock at start

      const fixtureId = `f1-${sk}`;
      const fixture = {
        id: fixtureId,
        leagueId: "f1",
        sport: "f1",
        scope: "weekend",
        title: `${session.country_name || session.location || "Grand Prix"} GP`,
        venue: session.circuit_short_name || session.location || undefined,
        startTime,
        lockTime,
        status: fixtureStatus,
      };

      const winnerMarket = {
        id: `f1-${sk}-winner`,
        fixtureId,
        leagueId: "f1",
        kind: "race_winner",
        label: "Race Winner",
        input: "choice",
        difficulty: 2,
        options,
        lockTime,
        status: fixtureStatus,
        result: winner,
      };

      const podiumMarket = {
        id: `f1-${sk}-podium`,
        fixtureId,
        leagueId: "f1",
        kind: "race_podium",
        label: "Podium (P1, P2, P3)",
        input: "podium",
        difficulty: 3,
        options,
        lockTime,
        status: fixtureStatus,
        result: podium,
      };

      boards.push({ fixture, markets: [winnerMarket, podiumMarket] });
    }

    return boards;
  });
}

function driverNames(drivers) {
  return (drivers || [])
    .map(
      (d) =>
        d.full_name ||
        `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() ||
        d.name_acronym ||
        null
    )
    .filter(Boolean);
}

/**
 * Build basketball board for nba|euroleague|lnb. Returns FixtureBoard[].
 * Historical season 2023-2024 => games are final => markets SETTLED (display only).
 */
export async function getBasketballBoard(leagueId) {
  const league = getLeague(leagueId);
  if (!league || league.sport !== "basketball") {
    throw Object.assign(new Error(`Unknown basketball league: ${leagueId}`), { notFound: true });
  }
  const apiLeagueId = LEAGUE_MAP[leagueId];
  const season = apiSportsSeasonString(league.season); // "2023-2024"

  return cache.getOrFetch(`predict:board:${leagueId}`, TTL_BBALL_BOARD, async () => {
    const games = await apisports.getGames({ leagueId: apiLeagueId, season });

    // ~10 most recent (by date).
    const sorted = [...games]
      .filter((g) => g?.date)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .slice(-10);

    const boards = [];
    for (const g of sorted) {
      const gid = String(g.id);
      const home = g?.teams?.home?.name ?? null;
      const away = g?.teams?.away?.name ?? null;
      const hs = g?.scores?.home?.total;
      const as = g?.scores?.away?.total;
      const short = g?.status?.short;
      const isFinal = ["FT", "AOT", "POST"].includes(short) || (hs != null && as != null);

      let result = null;
      if (isFinal && home && away && hs != null && as != null) {
        result = hs > as ? home : as > hs ? away : null;
      }

      const status = isFinal ? "settled" : "scheduled";
      const fixtureId = `${leagueId}-${gid}`;
      const startTime = g.date || null;

      const fixture = {
        id: fixtureId,
        leagueId,
        sport: "basketball",
        scope: "match",
        title: home && away ? `${home} vs ${away}` : "Game",
        home: home || undefined,
        away: away || undefined,
        venue: g?.arena?.name || undefined,
        startTime,
        lockTime: startTime,
        status,
      };

      const winnerMarket = {
        id: `${leagueId}-${gid}-winner`,
        fixtureId,
        leagueId,
        kind: "match_winner",
        label: "Vainqueur du match",
        input: "choice",
        difficulty: 1,
        options: [home, away].filter(Boolean),
        lockTime: startTime,
        status,
        result,
      };

      // Point-spread (écart de points): pick the winning-margin band.
      let spreadResult = null;
      if (isFinal && hs != null && as != null) {
        const margin = Math.abs(hs - as);
        spreadResult = margin === 0 ? null : marginBucket(margin);
      }
      const spreadMarket = {
        id: `${leagueId}-${gid}-spread`,
        fixtureId,
        leagueId,
        kind: "point_spread",
        label: "Écart de points (vainqueur)",
        input: "choice",
        difficulty: 2,
        options: MARGIN_BUCKETS,
        lockTime: startTime,
        status,
        result: spreadResult,
      };

      const markets = [winnerMarket, spreadMarket];

      // Top scorer (MVP) — options + result from per-player box scores. Costs 1
      // API request per game; cached 24h. Skipped gracefully if unavailable.
      try {
        const playerStats = await cache.getOrFetch(
          `predict:bball:players:${gid}`,
          TTL_BBALL_PLAYERS,
          () => apisports.getGamePlayerStats(gid)
        );
        const names = [...new Set((playerStats || []).map((s) => s?.player?.name).filter(Boolean))];
        if (names.length > 0) {
          let topScorer = null;
          if (isFinal) {
            let best = null;
            for (const s of playerStats) {
              const pts = Number(s?.points) || 0;
              const name = s?.player?.name;
              if (name && (!best || pts > best.pts)) best = { name, pts };
            }
            topScorer = best?.name ?? null;
          }
          markets.push({
            id: `${leagueId}-${gid}-scorer`,
            fixtureId,
            leagueId,
            kind: "top_scorer",
            label: "Meilleur scoreur (MVP)",
            input: "choice",
            difficulty: 2,
            options: names,
            lockTime: startTime,
            status,
            result: topScorer,
          });
        }
      } catch {
        // Box scores unavailable / rate-limited — skip the top-scorer market.
      }

      boards.push({ fixture, markets });
    }

    return boards;
  });
}

/**
 * Unified board accessor.
 */
export async function getBoard(leagueId) {
  if (leagueId === "f1") return getF1Board();
  return getBasketballBoard(leagueId);
}

/**
 * Flatten all markets across a league's board into a Map keyed by market id.
 * Used by settlement/store to resolve a prediction against its market.
 */
export async function getMarketsIndex(leagueId) {
  const boards = await getBoard(leagueId);
  const index = new Map();
  for (const b of boards) {
    for (const m of b.markets) index.set(m.id, m);
  }
  return index;
}

/**
 * Find a single market by id across ALL leagues (used by POST prediction).
 * leagueId is derived from the market id prefix to avoid scanning everything.
 */
export async function findMarketById(marketId) {
  const leagueId = leagueIdFromMarketId(marketId);
  if (!leagueId) return null;
  const index = await getMarketsIndex(leagueId);
  return index.get(marketId) || null;
}

export function leagueIdFromMarketId(marketId) {
  if (typeof marketId !== "string") return null;
  const prefix = marketId.split("-")[0];
  if (["f1", "nba", "euroleague", "lnb"].includes(prefix)) return prefix;
  return null;
}
