import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "@/theme/tokens";

/** Flat premium graphite app background (no color flood). */
export function Floodlight({ children }: { children: React.ReactNode }) {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: COLORS.bg } });
