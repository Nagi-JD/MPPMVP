import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSportTheme, type SportId, type SportTheme } from "./sportThemes";

interface SportThemeContextValue {
  sportId: SportId;
  theme: SportTheme;
  setSport: (id: string) => void;
}

const SportThemeContext = createContext<SportThemeContextValue | null>(null);

/**
 * Wraps a subtree (e.g. the F1 page or the NBA page) and makes the active
 * sport theme available to every component below via useSportTheme().
 */
export function SportThemeProvider({
  sport = "default",
  children,
}: {
  sport?: string;
  children: React.ReactNode;
}) {
  const [sportId, setSportId] = useState<string>(sport);
  // Keep the active theme in sync when the page changes the `sport` prop.
  useEffect(() => setSportId(sport), [sport]);
  const value = useMemo<SportThemeContextValue>(() => {
    const theme = getSportTheme(sportId);
    return { sportId: theme.id, theme, setSport: setSportId };
  }, [sportId]);
  return <SportThemeContext.Provider value={value}>{children}</SportThemeContext.Provider>;
}

/**
 * Returns the active sport palette.
 * - useSportTheme()          → the theme from the nearest SportThemeProvider.
 * - useSportTheme("f1")      → the theme for that sport/league, ignoring context.
 */
export function useSportTheme(sportId?: string): SportTheme {
  const ctx = useContext(SportThemeContext);
  if (sportId) return getSportTheme(sportId);
  if (ctx) return ctx.theme;
  return getSportTheme(undefined);
}

/** Access the provider controls (current id + setter) when you need to switch sports. */
export function useSportControls(): SportThemeContextValue {
  const ctx = useContext(SportThemeContext);
  if (!ctx) throw new Error("useSportControls must be used within a SportThemeProvider");
  return ctx;
}
