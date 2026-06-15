import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";

/** A single prediction market: label, difficulty, the inputs (children), and lock state. */
export function PredictionCard({
  label,
  difficulty,
  lockedLabel,
  sportId,
  children,
}: {
  label: string;
  difficulty: 1 | 2 | 3;
  lockedLabel?: string;
  sportId?: string;
  children: React.ReactNode;
}) {
  const t = useSportTheme(sportId);
  return (
    <View style={[styles.wrap, { backgroundColor: t.background, borderColor: t.border }]}>
      <View style={styles.head}>
        <Text style={[styles.label, { color: t.text }]}>{label}</Text>
        <Text style={[styles.diff, { color: t.accent }]}>
          {"◆".repeat(difficulty)}
          <Text style={{ color: t.border }}>{"◆".repeat(3 - difficulty)}</Text>
        </Text>
      </View>
      <View style={styles.row}>{children}</View>
      {lockedLabel ? <Text style={[styles.locked, { color: t.mutedText }]}>{lockedLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "700" },
  diff: { fontSize: 11, letterSpacing: 1 },
  row: { flexDirection: "row", gap: 8 },
  locked: { fontSize: 11, marginTop: 8 },
});
