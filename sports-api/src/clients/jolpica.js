import { JOLPICA_BASE } from "../config.js";

export async function getDriverStandings(year) {
  const url = `${JOLPICA_BASE}/${encodeURIComponent(year)}/driverStandings.json`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`jolpica network error: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`jolpica request failed (${res.status} ${res.statusText}) for ${year} driverStandings`);
  }
  const body = await res.json();
  const lists = body?.MRData?.StandingsTable?.StandingsLists || [];
  // Return the DriverStandings array of the most recent (only) standings list.
  return lists.length ? lists[0].DriverStandings || [] : [];
}
