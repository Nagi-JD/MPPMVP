import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
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
    <SportCard sportId={sportId} onPress={onPress} highlighted={active} style={{ padding: 0, overflow: "hidden" }}>
      <LinearGradient
        colors={[t.primary + "22", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.row}
      >
        <View style={[styles.badge, { backgroundColor: t.primary }]}>
          <Text style={[styles.badgeText, { color: "#fff" }]}>{org.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.org, { color: t.text }]}>{org}</Text>
          <Text style={[styles.meta, { color: t.mutedText }]}>{t.name} · Season {season}</Text>
        </View>
        <Text style={[styles.season, { color: t.accent }]}>{season}</Text>
      </LinearGradient>
    </SportCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: FONTS.display, fontSize: 14 },
  org: { fontFamily: FONTS.display, fontSize: 17 },
  meta: { fontFamily: FONTS.body, fontSize: 12, marginTop: 2 },
  season: { fontFamily: FONTS.monoBold, fontSize: 14 },
});
