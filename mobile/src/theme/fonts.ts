/** Font family names (loaded in App.tsx via @expo-google-fonts). Global, not per-sport. */
export const FONTS = {
  display: "Archivo_800ExtraBold", // big headings, team names
  displayBold: "Archivo_700Bold",
  body: "Inter_400Regular",
  bodyMed: "Inter_600SemiBold",
  mono: "JetBrainsMono_500Medium", // HUD numerals
  monoBold: "JetBrainsMono_700Bold",
} as const;
