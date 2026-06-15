/** Premium neutral-graphite design tokens (Apple Sports / SofaScore style). */
export const COLORS = {
  // semantic (preferred going forward)
  bg: "#08080A",
  surface: "#141417",
  surfaceAlt: "#1C1C21",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#F3F3F5",
  textMuted: "#8E8E96",
  textFaint: "#5A5A62",
  // legacy keys remapped to graphite (kept so existing components compile;
  // migrated away in later tasks)
  ink: "#08080A",
  ink800: "#141417",
  ink700: "#1C1C21",
  ink600: "#26262C",
  line: "rgba(255,255,255,0.07)",
  white: "#F3F3F5",
  muted: "#8E8E96",
  // neutral default accent (sport accents override via categories.ts)
  violet: "#E8E8EC",
  violetLight: "#FFFFFF",
  violetDark: "#C9C9CF",
  magenta: "#8E8E96",
  lime: "#34D27B",   // positive/correct (restrained green, not neon)
  amber: "#E0A23C",
  bronze: "#C98A5E",
} as const;

export const RADIUS = { sm: 10, md: 14, lg: 18, "2xl": 18, xl: 14 } as const;

/** Subtle elevation — soft, not huge. */
export const SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

// GLOW kept as a no-op-ish soft shadow alias so any importer still compiles.
export const GLOW = SHADOW;
