import { APISPORTS_BASKETBALL_BASE, APISPORTS_KEY } from "../config.js";

async function apiGet(path) {
  const url = `${APISPORTS_BASKETBALL_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { "x-apisports-key": APISPORTS_KEY },
    });
  } catch (err) {
    throw new Error(`API-SPORTS network error: ${err.message}`);
  }

  if (!res.ok) {
    // Never leak the key; only surface status + path.
    throw new Error(`API-SPORTS request failed (${res.status} ${res.statusText}) for ${path}`);
  }

  const body = await res.json();

  // API-SPORTS reports errors in a 200 body via `errors`.
  if (body && body.errors && Object.keys(body.errors).length > 0) {
    throw new Error(`API-SPORTS returned errors for ${path}: ${JSON.stringify(body.errors)}`);
  }

  return Array.isArray(body?.response) ? body.response : [];
}

export async function getGames({ leagueId, season, live = false }) {
  if (live) {
    return apiGet(`/games?live=all`);
  }
  return apiGet(`/games?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`);
}

export async function getStandings({ leagueId, season }) {
  return apiGet(`/standings?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`);
}

export async function getGameById(id) {
  return apiGet(`/games?id=${encodeURIComponent(id)}`);
}
