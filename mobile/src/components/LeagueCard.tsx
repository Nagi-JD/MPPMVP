import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { SportCard } from "./SportCard";

export function LeagueCard({
  org,
  season,
  sportId,
  onPress,
  active,
}: {
  org: string;
  season: number;
  sportId: string;
  onPress?: () => void;
  active?: boolean;
}) {
  const t = useSportTheme(sportId);
  return (
    <SportCard sportId={sportId} onPress={onPress} highlighted={active}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: t.primary }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.org, { color: t.text }]}>{org}</Text>
          <Text style={[styles.meta, { color: t.mutedText }]}>{t.name} · Season {season}</Text>
        </View>
        <Text style={[styles.season, { color: t.accent }]}>{season}</Text>
      </View>
    </SportCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  org: { fontSize: 16, fontWeight: "800" },
  meta: { fontSize: 12, marginTop: 2 },
  season: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
});
