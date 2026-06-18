// Board derivation: build FixtureBoard[] over REAL upstream data.
// F1 = full prediction loop (OpenF1). basketball = real settled display (API-SPORTS).

import * as cache from "../cache.js";
import * as openf1 from "../clients/openf1.js";
import * as apisports from "../clients/apisports.js";
import * as jolpica from "../clients/jolpica.js";
import { deriveSessionResults, normalizeStandings, normalizeDriverStandings } from "../normalize.js";
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

    // Group every session by meeting (race weekend) so a race fixture can
    // expose its Qualifying / Sprint / Race markets together.
    const meetings = new Map(); // meeting_key -> { quali, sprint, race }
    for (const s of sessions) {
      const mk = s.meeting_key;
      if (mk == null) continue;
      const entry = meetings.get(mk) || {};
      if (s.session_name === "Race") entry.race = s;
      else if (s.session_name === "Qualifying") entry.quali = s;
      else if (s.session_name === "Sprint") entry.sprint = s;
      meetings.set(mk, entry);
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

      const meeting = meetings.get(session.meeting_key) || { race: session };

      // Settle one session's podium (winner + "p1,p2,p3") once it has ended.
      // Cached 24h per session; degrades to nulls on OpenF1 404/429.
      const podiumOf = async (sess) => {
        if (!sess || !sessionEnded(sess, now)) return { winner: null, podium: null };
        try {
          const results = await cache.getOrFetch(
            `predict:f1:results:${sess.session_key}`,
            TTL_F1_RESULT,
            async () => {
              await sleep(250);
              const positions = await openf1.getPositions(sess.session_key);
              return deriveSessionResults(drivers, positions);
            }
          );
          if (results.length > 0) {
            return {
              winner: results[0].driver,
              podium: results.slice(0, 3).map((r) => r.driver).join(","),
            };
          }
        } catch {
          /* position stream unavailable -> no result yet */
        }
        return { winner: null, podium: null };
      };

      const raceRes = await podiumOf(meeting.race || session);
      const qualiRes = await podiumOf(meeting.quali);
      const sprintRes = await podiumOf(meeting.sprint);

      // Fastest lap of the race: min positive lap_duration -> driver.
      let fastest = null;
      if (sessionEnded(session, now)) {
        try {
          fastest = await cache.getOrFetch(`predict:f1:fastest:${sk}`, TTL_F1_RESULT, async () => {
            await sleep(250);
            const laps = await openf1.getLaps(sk);
            let best = null;
            for (const l of laps) {
              const d = Number(l.lap_duration);
              if (Number.isFinite(d) && d > 0 && (!best || d < best.d)) best = { d, num: l.driver_number };
            }
            if (best == null) return null;
            const dr = (drivers || []).find((x) => x.driver_number === best.num);
            return dr
              ? dr.full_name || `${dr.first_name ?? ""} ${dr.last_name ?? ""}`.trim() || dr.name_acronym
              : null;
          });
        } catch {
          fastest = null;
        }
      }

      // Per-session status: scheduled before its start, settled once its result
      // is known, locked in between. A market locks at ITS session's start.
      const sessStatus = (sess, hasResult) =>
        f1FixtureStatus(sess || session, now, sessionEnded(sess || session, now) && hasResult);

      const startTime = session.date_start || null;
      const fixtureStatus = f1FixtureStatus(session, now, sessionEnded(session, now) && raceRes.winner != null);

      const fixtureId = `f1-${sk}`;
      const fixture = {
        id: fixtureId,
        leagueId: "f1",
        sport: "f1",
        scope: "weekend",
        title: `${session.country_name || session.location || "Grand Prix"} GP`,
        venue: session.circuit_short_name || session.location || undefined,
        startTime,
        lockTime: startTime,
        status: fixtureStatus,
      };

      const markets = [];

      // Qualifying podium — locks at qualifying start (before the race).
      if (meeting.quali) {
        markets.push({
          id: `f1-${sk}-quali`,
          fixtureId,
          leagueId: "f1",
          kind: "quali_podium",
          label: "Podium qualifications",
          input: "podium",
          difficulty: 2,
          options,
          lockTime: meeting.quali.date_start || startTime,
          status: sessStatus(meeting.quali, qualiRes.podium != null),
          result: qualiRes.podium,
        });
      }

      // Race winner + podium — lock at race start.
      markets.push({
        id: `f1-${sk}-winner`,
        fixtureId,
        leagueId: "f1",
        kind: "race_winner",
        label: "Vainqueur de la course",
        input: "choice",
        difficulty: 2,
        options,
        lockTime: startTime,
        status: fixtureStatus,
        result: raceRes.winner,
      });
      markets.push({
        id: `f1-${sk}-podium`,
        fixtureId,
        leagueId: "f1",
        kind: "race_podium",
        label: "Podium course (P1, P2, P3)",
        input: "podium",
        difficulty: 3,
        options,
        lockTime: startTime,
        status: fixtureStatus,
        result: raceRes.podium,
      });

      // Sprint podium — only on sprint weekends; locks at sprint start.
      if (meeting.sprint) {
        markets.push({
          id: `f1-${sk}-sprint`,
          fixtureId,
          leagueId: "f1",
          kind: "sprint_podium",
          label: "Podium sprint",
          input: "podium",
          difficulty: 2,
          options,
          lockTime: meeting.sprint.date_start || startTime,
          status: sessStatus(meeting.sprint, sprintRes.podium != null),
          result: sprintRes.podium,
        });
      }

      // Fastest lap of the race — locks at race start.
      markets.push({
        id: `f1-${sk}-fastest`,
        fixtureId,
        leagueId: "f1",
        kind: "fastest_lap",
        label: "Meilleur tour en course",
        input: "choice",
        difficulty: 2,
        options,
        lockTime: startTime,
        status: sessStatus(session, fastest != null),
        result: fastest,
      });

      boards.push({ fixture, markets });
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

    // Top-scorer needs 1 box-score request per game. On the Free plan
    // (10 req/min) we cap it to the most recent games and pace cold fetches.
    const scorerGids = new Set(sorted.slice(-6).map((x) => String(x.id)));

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
      // API request per game; cached 24h. Capped to recent games and paced on
      // cold fetches to respect the Free plan's 10 req/min. Skipped gracefully.
      try {
        if (!scorerGids.has(gid)) throw new Error("skip-scorer (older game)");
        const cacheKey = `predict:bball:players:${gid}`;
        if (cache.get(cacheKey) === undefined) await sleep(700); // pace cold fetches
        const playerStats = await cache.getOrFetch(
          cacheKey,
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

const TTL_SEASON = 8 * 60 * 60 * 1000; // 8h

/**
 * Long-term "pre-season" markets for a league, returned as a single synthetic
 * `season`-scope fixture so it renders alongside fixtures. Options come from
 * standings; results stay null (settled at season end). Open all season:
 * lockTime = end of the season.
 */
async function seasonBoard(leagueId) {
  const league = getLeague(leagueId);
  if (!league) return null;

  if (leagueId === "f1") {
    const year = new Date().getFullYear();
    return cache.getOrFetch(`predict:season:f1:${year}`, TTL_SEASON, async () => {
      let drivers = [];
      let constructors = [];
      try {
        const rows = normalizeDriverStandings(await jolpica.getDriverStandings(year));
        drivers = [...new Set(rows.map((r) => r.name).filter(Boolean))];
        constructors = [...new Set(rows.map((r) => r?.extra?.constructor).filter(Boolean))];
      } catch {
        /* standings unavailable */
      }
      const lock = `${year}-12-31T23:59:59+00:00`;
      const status = new Date() < new Date(lock) ? "scheduled" : "locked";
      const fixtureId = `f1-season-${year}`;
      const fixture = {
        id: fixtureId, leagueId: "f1", sport: "f1", scope: "season",
        title: `Championnat F1 ${year}`, startTime: lock, lockTime: lock, status,
      };
      const markets = [];
      if (drivers.length) {
        markets.push({
          id: `${fixtureId}-driver`, fixtureId, leagueId: "f1", kind: "driver_champion",
          label: "Champion du monde (pilote)", input: "choice", difficulty: 3,
          options: drivers, lockTime: lock, status, result: null,
        });
      }
      if (constructors.length) {
        markets.push({
          id: `${fixtureId}-constructor`, fixtureId, leagueId: "f1", kind: "constructor_champion",
          label: "Champion du monde (constructeur)", input: "choice", difficulty: 3,
          options: constructors, lockTime: lock, status, result: null,
        });
      }
      return markets.length ? { fixture, markets } : null;
    });
  }

  const apiLeagueId = LEAGUE_MAP[leagueId];
  if (!apiLeagueId) return null;
  const season = apiSportsSeasonString(league.season);
  return cache.getOrFetch(`predict:season:${leagueId}:${season}`, TTL_SEASON, async () => {
    let teams = [];
    const byConf = new Map();
    try {
      const rows = normalizeStandings(await apisports.getStandings({ leagueId: apiLeagueId, season }));
      teams = [...new Set(rows.map((r) => r.name).filter(Boolean))];
      for (const r of rows) {
        const conf = r?.extra?.group;
        if (conf && r.name) {
          if (!byConf.has(conf)) byConf.set(conf, []);
          byConf.get(conf).push(r.name);
        }
      }
    } catch {
      /* standings unavailable */
    }
    if (!teams.length) return null;
    const lock = `${league.season}-06-30T23:59:59+00:00`;
    const status = new Date() < new Date(lock) ? "scheduled" : "locked";
    const fixtureId = `${leagueId}-season-${league.season}`;
    const fixture = {
      id: fixtureId, leagueId, sport: "basketball", scope: "season",
      title: `${league.org} ${season}`, startTime: lock, lockTime: lock, status,
    };
    const markets = [
      {
        id: `${fixtureId}-champion`, fixtureId, leagueId, kind: "season_champion",
        label: `Champion ${league.org}`, input: "choice", difficulty: 3,
        options: teams, lockTime: lock, status, result: null,
      },
    ];
    // NBA: add conference winners. Standings group by DIVISION, so keep only
    // groups that are actual conferences (East/West) to avoid a market per
    // division. If the feed exposes no conference-level group, we ship just the
    // overall champion market.
    if (leagueId === "nba") {
      for (const [conf, list] of byConf) {
        if (!/conference/i.test(conf)) continue; // skip divisions, keep East/West conferences
        const opts = [...new Set(list)];
        if (opts.length) {
          markets.push({
            id: `${fixtureId}-conf-${conf.replace(/\s+/g, "").toLowerCase()}`,
            fixtureId, leagueId, kind: "season_champion",
            label: `Vainqueur ${conf}`, input: "choice", difficulty: 3,
            options: opts, lockTime: lock, status, result: null,
          });
        }
      }
    }
    return { fixture, markets };
  });
}

/**
 * Unified board accessor. Prepends the league's pre-season markets fixture.
 */
export async function getBoard(leagueId) {
  const base = leagueId === "f1" ? await getF1Board() : await getBasketballBoard(leagueId);
  let season = null;
  try {
    season = await seasonBoard(leagueId);
  } catch {
    season = null;
  }
  return season ? [season, ...base] : base;
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
