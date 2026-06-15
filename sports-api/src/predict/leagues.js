// Static league list for the mobile prediction model.

const LEAGUES = [
  { id: "f1", sport: "f1", org: "Formula 1", season: 2026 },
  { id: "nba", sport: "basketball", org: "NBA", season: 2024 },
  { id: "euroleague", sport: "basketball", org: "EuroLeague", season: 2024 },
  { id: "lnb", sport: "basketball", org: "LNB France", season: 2024 },
];

export function listLeagues() {
  return LEAGUES.map((l) => ({ ...l }));
}

export function getLeague(id) {
  return LEAGUES.find((l) => l.id === id) || null;
}

/**
 * Basketball uses the 2023-2024 season string when calling API-SPORTS:
 * season number 2024 -> "2023-2024".
 */
export function apiSportsSeasonString(seasonNumber) {
  const n = Number(seasonNumber);
  return `${n - 1}-${n}`;
}
