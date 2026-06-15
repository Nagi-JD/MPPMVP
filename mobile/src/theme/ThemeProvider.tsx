import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CATEGORY_THEMES, type CategoryId, type CategoryTheme } from "@/theme/categories";

interface ThemeContextValue {
  category: CategoryId;
  theme: CategoryTheme;
  setCategory: (id: CategoryId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategoryState] = useState<CategoryId>("default");

  // Stable identity so consumer effects (useFocusEffect on screens) don't re-fire
  // every render. Guarded functional update => no re-render when unchanged.
  const setCategory = useCallback((id: CategoryId) => {
    setCategoryState((cur) => (cur === id ? cur : id));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ category, theme: CATEGORY_THEMES[category], setCategory }),
    [category, setCategory]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useCategory(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { category: "default", theme: CATEGORY_THEMES.default, setCategory: () => {} };
  }
  return ctx;
}
