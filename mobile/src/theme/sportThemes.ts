/**
 * Per-sport / per-league theming. Each palette is derived from the dominant
 * colours of the league's official identity (no logo assets are used here —
 * colours only).
 *
 * Token contract (every theme implements all of these):
 *   primary      brand colour, main actions & highlights
 *   secondary    supporting brand colour
 *   background    screen background
 *   surface      card / panel background
 *   surfaceAlt   nested / pressed surface
 *   text         primary text on background/surface
 *   mutedText    secondary text
 *   border       hairline borders & dividers
 *   accent       attention colour (badges, progress)
 *   success      correct prediction / positive
 *   danger       wrong prediction / destructive
 */
export type SportId = "f1" | "nba" | "euroleague" | "lnb" | "default";

export interface SportTheme {
  id: SportId;
  name: string;
  /** Visual register, useful for shadows/blur decisions. */
  mode: "dark";
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  success: string;
  danger: string;
}

// F1 — red + carbon black + white + metallic grey. Premium racing.
const f1: SportTheme = {
  id: "f1",
  name: "Formula 1",
  mode: "dark",
  primary: "#E10600", // F1 red
  secondary: "#1F1F27", // carbon
  background: "#0A0A0F", // near-black
  surface: "#15151E",
  surfaceAlt: "#1F1F2A",
  text: "#FFFFFF",
  mutedText: "#9A9AA8", // metallic grey
  border: "#2A2A35",
  accent: "#C8C8D0", // brushed silver
  success: "#2ECC71",
  danger: "#E10600",
};

// NBA — NBA blue + NBA red + white + navy night. Scoreboard / fantasy.
const nba: SportTheme = {
  id: "nba",
  name: "NBA",
  mode: "dark",
  primary: "#1D428A", // NBA blue
  secondary: "#C8102E", // NBA red
  background: "#0B1A33", // blue night
  surface: "#13244A",
  surfaceAlt: "#1B3160",
  text: "#FFFFFF",
  mutedText: "#9DB0D0", // light blue-grey
  border: "#274680",
  accent: "#F4A800", // hardwood amber pop
  success: "#33C27F",
  danger: "#C8102E",
};

// EuroLeague — orange + black.
const euroleague: SportTheme = {
  id: "euroleague",
  name: "EuroLeague",
  mode: "dark",
  primary: "#FF6B00",
  secondary: "#111114",
  background: "#0C0B0A",
  surface: "#17150F",
  surfaceAlt: "#211D14",
  text: "#FFFFFF",
  mutedText: "#B4A892",
  border: "#322B1E",
  accent: "#FF8A33",
  success: "#33C27F",
  danger: "#E5484D",
};

// LNB France — French blue + red.
const lnb: SportTheme = {
  id: "lnb",
  name: "LNB France",
  mode: "dark",
  primary: "#0055A4", // bleu
  secondary: "#EF4135", // rouge
  background: "#0A1020",
  surface: "#111B30",
  surfaceAlt: "#172642",
  text: "#FFFFFF",
  mutedText: "#9FB0CC",
  border: "#23365C",
  accent: "#EF4135",
  success: "#33C27F",
  danger: "#EF4135",
};

// Neutral fallback (app brand violet).
const def: SportTheme = {
  id: "default",
  name: "MPP+",
  mode: "dark",
  primary: "#8B5CF6",
  secondary: "#E879F9",
  background: "#0B0916",
  surface: "#15112A",
  surfaceAlt: "#1E1838",
  text: "#F5F3FF",
  mutedText: "#A89FC9",
  border: "rgba(255,255,255,0.10)",
  accent: "#B6FF3C",
  success: "#B6FF3C",
  danger: "#E879F9",
};

export const SPORT_THEMES: Record<SportId, SportTheme> = {
  f1,
  nba,
  euroleague,
  lnb,
  default: def,
};

/** Map an arbitrary league/sport id to a known theme id. */
export function resolveSportId(id: string | undefined): SportId {
  if (!id) return "default";
  const key = id.toLowerCase();
  if (key.includes("f1") || key.includes("formula")) return "f1";
  if (key.includes("nba")) return "nba";
  if (key.includes("euro")) return "euroleague";
  if (key.includes("lnb")) return "lnb";
  const known: string[] = ["f1", "nba", "euroleague", "lnb"];
  return known.includes(key) ? (key as SportId) : "default";
}

export function getSportTheme(id: string | undefined): SportTheme {
  return SPORT_THEMES[resolveSportId(id)];
}
