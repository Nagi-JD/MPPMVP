// Pure functions mapping upstream payloads -> normalized model.

const BASKETBALL_LIVE = new Set(["Q1", "Q2", "Q3", "Q4", "HT", "BT", "OT", "LIVE"]);
const BASKETBALL_FINAL = new Set(["FT", "AOT", "POST"]);

export function basketballStatus(shortStatus) {
  if (shortStatus === "NS") return "upcoming";
  if (BASKETBALL_LIVE.has(shortStatus)) return "live";
  if (BASKETBALL_FINAL.has(shortStatus)) return "final";
  // Fall back: API-SPORTS marks finished via status.long sometimes; default to final
  // only when clearly not scheduled. Treat unknowns conservatively as final.
  return "final";
}

/**
 * Normalize an API-SPORTS basketball game object.
 */
export function normalizeGame(g, category) {
  const short = g?.status?.short;
  const status = basketballStatus(short);
  return {
    id: String(g?.id),
    category,
    kind: "game",
    status,
    startTime: g?.date || null,
    name:
      g?.teams?.home?.name && g?.teams?.away?.name
        ? `${g.teams.home.name} vs ${g.teams.away.name}`
        : g?.league?.name || "Game",
    home: {
      name: g?.teams?.home?.name ?? null,
      score: g?.scores?.home?.total ?? null,
    },
    away: {
      name: g?.teams?.away?.name ?? null,
      score: g?.scores?.away?.total ?? null,
    },
    sub: g?.status?.long || g?.league?.name || undefined,
    raw: g,
  };
}

/**
 * Normalize API-SPORTS basketball standings.
 * The standings endpoint returns response = [ [ row, row, ... ] ] (groups).
 */
export function normalizeStandings(response) {
  const rows = [];
  const groups = Array.isArray(response) ? response : [];
  for (const group of groups) {
    const list = Array.isArray(group) ? group : [group];
    for (const r of list) {
      rows.push({
        rank: r?.position ?? null,
        name: r?.team?.name ?? null,
        played: r?.games?.played ?? null,
        won: r?.games?.win?.total ?? null,
        lost: r?.games?.lose?.total ?? null,
        points: r?.points?.for ?? null,
        extra: {
          group: r?.group?.name ?? null,
          winPercentage: r?.games?.win?.percentage ?? null,
          pointsAgainst: r?.points?.against ?? null,
        },
      });
    }
  }
  return rows;
}

/**
 * F1 session -> normalized event of kind "session".
 */
export function normalizeSession(s, now = new Date()) {
  const start = s?.date_start ? new Date(s.date_start) : null;
  const end = s?.date_end ? new Date(s.date_end) : null;
  let status = "upcoming";
  if (start && now < start) status = "upcoming";
  else if (start && end && now >= start && now <= end) status = "live";
  else if (end && now > end) status = "final";
  else if (start && now >= start) status = "live"; // started, no/unknown end

  const circuit = s?.circuit_short_name ? ` (${s.circuit_short_name})` : "";
  return {
    id: String(s?.session_key),
    category: "f1",
    kind: "session",
    status,
    startTime: s?.date_start || null,
    name: `${s?.session_name || "Session"}${circuit}`,
    sub: s?.country_name || s?.location || undefined,
    raw: s,
  };
}

/**
 * Derive ordered session results from OpenF1 drivers + position rows.
 * positions stream gives time-series (driver_number, position, date); we take
 * the latest position per driver and join with driver metadata.
 */
export function deriveSessionResults(drivers, positions) {
  const driverByNum = new Map();
  for (const d of drivers || []) {
    driverByNum.set(d.driver_number, d);
  }

  // Latest position per driver_number.
  const latest = new Map(); // driver_number -> position row
  for (const p of positions || []) {
    const prev = latest.get(p.driver_number);
    if (!prev || new Date(p.date) >= new Date(prev.date)) {
      latest.set(p.driver_number, p);
    }
  }

  const rows = [];
  for (const [num, p] of latest.entries()) {
    const d = driverByNum.get(num);
    rows.push({
      position: p.position ?? null,
      driver: d
        ? d.full_name || `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || d.name_acronym
        : String(num),
      team: d?.team_name ?? undefined,
      gap: undefined, // OpenF1 position stream has no gap field
      points: undefined,
    });
  }

  rows.sort((a, b) => {
    if (a.position == null) return 1;
    if (b.position == null) return -1;
    return a.position - b.position;
  });
  return rows;
}

/**
 * Normalize jolpica/Ergast driverStandings rows.
 */
export function normalizeDriverStandings(standings) {
  return (standings || []).map((s) => {
    const d = s.Driver || {};
    const constructor = (s.Constructors && s.Constructors[0]) || {};
    return {
      rank: s.position ? Number(s.position) : null,
      name: `${d.givenName ?? ""} ${d.familyName ?? ""}`.trim() || d.driverId || null,
      played: null, // not provided by standings endpoint
      won: s.wins != null ? Number(s.wins) : null,
      lost: null,
      points: s.points != null ? Number(s.points) : null,
      extra: {
        constructor: constructor.name ?? null,
        nationality: d.nationality ?? null,
        code: d.code ?? null,
      },
    };
  });
}
