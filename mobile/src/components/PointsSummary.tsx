import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { AnimatedCounter } from "./AnimatedCounter";

interface Props {
  points: number;
  accuracy?: number;
  accent?: string;
}

/** Compact inline points + accuracy summary, for headers. */
export function PointsSummary({ points, accuracy, accent }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.metric}>
        <AnimatedCounter value={points} style={accent ? { color: accent } : undefined} />
        <Text style={styles.label}>PTS</Text>
      </View>
      {accuracy != null ? (
        <View style={styles.metric}>
          <Text style={styles.value}>{Math.round(accuracy)}%</Text>
          <Text style={styles.label}>ACC</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  metric: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  value: {
    fontFamily: FONTS.monoBold,
    fontSize: 18,
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
});
