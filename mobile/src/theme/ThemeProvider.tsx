import React, { createContext, useContext, useRef, useState } from "react";
import { Animated } from "react-native";
import { CATEGORY_THEMES, type CategoryId, type CategoryTheme } from "@/theme/categories";

type AnimatedTint = ReturnType<Animated.Value["interpolate"]>;

interface ThemeContextValue {
  category: CategoryId;
  theme: CategoryTheme;
  setCategory: (id: CategoryId) => void;
  /** Animated tint color for the background wash; transitions smoothly on change. */
  animatedTint: AnimatedTint;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategoryState] = useState<CategoryId>("default");
  const fromTint = useRef(CATEGORY_THEMES.default.tint);
  const toTint = useRef(CATEGORY_THEMES.default.tint);
  const progress = useRef(new Animated.Value(1)).current;
  const [, force] = useState(0);

  function setCategory(id: CategoryId) {
    if (id === category) return;
    fromTint.current = CATEGORY_THEMES[category].tint;
    toTint.current = CATEGORY_THEMES[id].tint;
    progress.setValue(0);
    setCategoryState(id);
    force((n) => n + 1); // refresh interpolation refs
    Animated.timing(progress, { toValue: 1, duration: 450, useNativeDriver: false }).start();
  }

  // Recompute interpolation whenever the from/to endpoints change.
  const animatedTint = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [fromTint.current, toTint.current],
  });

  const value: ThemeContextValue = {
    category,
    theme: CATEGORY_THEMES[category],
    setCategory,
    animatedTint,
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useCategory(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback when used outside a provider.
    const progress = new Animated.Value(1);
    return {
      category: "default",
      theme: CATEGORY_THEMES.default,
      setCategory: () => {},
      animatedTint: progress.interpolate({ inputRange: [0, 1], outputRange: [CATEGORY_THEMES.default.tint, CATEGORY_THEMES.default.tint] }),
    };
  }
  return ctx;
}
