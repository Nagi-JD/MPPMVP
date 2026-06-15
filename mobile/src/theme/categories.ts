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
  default:    { id: "default",    label: "MPP+",       accent: "#E8E8EC", accent2: "#8E8E96", tint: "rgba(255,255,255,0.05)" },
  nba:        { id: "nba",        label: "NBA",        accent: "#F2641E", accent2: "#C8102E", tint: "rgba(242,100,30,0.10)" },
  euroleague: { id: "euroleague", label: "EuroLeague", accent: "#E0A23C", accent2: "#FF7A00", tint: "rgba(224,162,60,0.10)" },
  lnb:        { id: "lnb",        label: "LNB France", accent: "#3B6FB5", accent2: "#EF4135", tint: "rgba(59,111,181,0.10)" },
  f1:         { id: "f1",         label: "Formula 1",  accent: "#E10600", accent2: "#C8C8D0", tint: "rgba(225,6,0,0.10)" },
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
