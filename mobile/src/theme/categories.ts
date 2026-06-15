/** Per-league/category accent palettes derived from official logo colors. */
export type CategoryId = "default" | "nba" | "euroleague" | "lnb" | "f1";

export interface CategoryTheme {
  id: CategoryId;
  label: string;
  accent: string;   // primary logo color (borders, buttons, active states)
  accent2: string;  // secondary logo color
  tint: string;     // subtle translucent background wash
}

export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  default:    { id: "default",    label: "MPP+",       accent: "#8B5CF6", accent2: "#E879F9", tint: "rgba(139,92,246,0.10)" },
  nba:        { id: "nba",        label: "NBA",        accent: "#1D428A", accent2: "#C8102E", tint: "rgba(29,66,138,0.14)" },
  euroleague: { id: "euroleague", label: "EuroLeague", accent: "#FF6B00", accent2: "#FF8A33", tint: "rgba(255,107,0,0.12)" },
  lnb:        { id: "lnb",        label: "LNB France", accent: "#0055A4", accent2: "#EF4135", tint: "rgba(0,85,164,0.14)" },
  f1:         { id: "f1",         label: "Formula 1",  accent: "#E10600", accent2: "#C8C8D0", tint: "rgba(225,6,0,0.12)" },
};

/** Map a league id or sport name to a category id. */
export function resolveCategory(idOrSport: string | undefined): CategoryId {
  if (!idOrSport) return "default";
  const k = idOrSport.toLowerCase();
  if (k.includes("f1") || k.includes("formula")) return "f1";
  if (k.includes("nba")) return "nba";
  if (k.includes("euro")) return "euroleague";
  if (k.includes("lnb")) return "lnb";
  if (k.includes("basketball")) return "nba"; // sport-level fallback
  return "default";
}

export function getCategoryTheme(idOrSport: string | undefined): CategoryTheme {
  return CATEGORY_THEMES[resolveCategory(idOrSport)];
}
