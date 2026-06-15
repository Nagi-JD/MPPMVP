import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";

export function SeasonProgressBar({
  value,
  label,
  sportId,
}: {
  value: number; // 0..1
  label?: string;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.head}>
          <Text style={[styles.label, { color: t.mutedText }]}>{label}</Text>
          <Text style={[styles.pct, { color: t.text }]}>{Math.round(pct * 100)}%</Text>
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: t.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12 },
  pct: { fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
