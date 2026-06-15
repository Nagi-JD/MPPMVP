import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/theme/tokens";

/**
 * Arena floodlight wash over the ink background. The web uses two radial
 * glows (violet top-center, magenta top-right); we approximate with two
 * stacked linear gradients fading down into the ink.
 */
export function Floodlight({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["rgba(139,92,246,0.22)", "transparent"]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(232,121,249,0.12)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ink },
});
