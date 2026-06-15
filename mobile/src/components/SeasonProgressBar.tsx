import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

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
        <LinearGradient
          colors={[t.primary, t.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontFamily: FONTS.body, fontSize: 12 },
  pct: { fontFamily: FONTS.monoBold, fontSize: 12 },
  track: { height: 9, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
