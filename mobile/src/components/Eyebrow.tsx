import React from "react";
import { Text, StyleSheet, type TextStyle } from "react-native";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

/** Small wide mono uppercase label (web .eyebrow). */
export function Eyebrow({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.eyebrow, style]}>{typeof children === "string" ? children.toUpperCase() : children}</Text>;
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 2.4, color: COLORS.muted },
});
