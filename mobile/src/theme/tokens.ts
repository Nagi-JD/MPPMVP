/** Design tokens mirrored from the web app's tailwind.config.ts. Single brand. */
export const COLORS = {
  ink: "#0B0916",
  ink800: "#15112A",
  ink700: "#1E1838",
  ink600: "#272047",
  line: "rgba(255,255,255,0.08)",
  violet: "#8B5CF6",
  violetLight: "#A78BFA",
  violetDark: "#6D28D9",
  magenta: "#E879F9",
  lime: "#B6FF3C",
  amber: "#FFB020",
  muted: "#A89FC9",
  white: "#F5F3FF",
  bronze: "#C98A5E",
} as const;

export const RADIUS = { lg: 14, xl: 16, "2xl": 20 } as const;

/** Violet glow used on raised/active surfaces (web shadow-glow). */
export const GLOW = {
  shadowColor: COLORS.violet,
  shadowOpacity: 0.45,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
} as const;
