import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/theme/tokens";
import { useCategory } from "@/theme/ThemeProvider";

/**
 * Arena background: ink base + a neutral top floodlight glow + a per-category
 * tint overlay that cross-fades smoothly when the active category changes.
 */
export function Floodlight({ children }: { children: React.ReactNode }) {
  const { animatedTint } = useCategory();
  return (
    <View style={styles.root}>
      {/* neutral floodlight depth (brand) */}
      <LinearGradient
        colors={["rgba(139,92,246,0.16)", "transparent"]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      {/* per-category tint wash (animated) */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: animatedTint }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
});
