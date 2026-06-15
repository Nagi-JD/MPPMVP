import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;

export const CORS_ORIGINS = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const APISPORTS_KEY = process.env.APISPORTS_KEY || "";
export const APISPORTS_BASKETBALL_BASE =
  process.env.APISPORTS_BASKETBALL_BASE || "https://v1.basketball.api-sports.io";

export const OPENF1_BASE = process.env.OPENF1_BASE || "https://api.openf1.org/v1";
export const JOLPICA_BASE = process.env.JOLPICA_BASE || "https://api.jolpi.ca/ergast/f1";

// category -> basketball leagueId. f1 is special-cased (not in this map).
export const LEAGUE_MAP = {
  nba: 12,
  euroleague: 120,
  lnb: 2,
};

export const CATEGORIES = ["nba", "lnb", "euroleague", "f1"];

/**
 * Basketball season runs Aug -> Jun.
 * If month (1-12) >= 8 -> `${y}-${y+1}` else `${y-1}-${y}`.
 * Spec note: "if month>=7" (0-indexed July) which is month index 7 => August.
 */
export function currentBasketballSeason(date = new Date()) {
  const y = date.getFullYear();
  const monthIndex = date.getMonth(); // 0 = Jan ... 7 = Aug
  if (monthIndex >= 7) {
    return `${y}-${y + 1}`;
  }
  return `${y - 1}-${y}`;
}
