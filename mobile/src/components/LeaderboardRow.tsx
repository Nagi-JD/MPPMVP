import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { RankBadge } from "./RankBadge";
import type { RankTier } from "@/types";

export function LeaderboardRow({
  rank,
  name,
  points,
  tier,
  accuracy,
  me,
  sportId,
}: {
  rank: number;
  name: string;
  points: number;
  tier: RankTier;
  accuracy?: number;
  me?: boolean;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);
  const medal = rank <= 3 ? [t.accent, t.primary, t.secondary][rank - 1] : t.mutedText;
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: t.border, backgroundColor: me ? t.surfaceAlt : "transparent" },
      ]}
    >
      <Text style={[styles.rank, { color: medal }]}>{String(rank).padStart(2, "0")}</Text>
      <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
        {name}
        {me ? <Text style={{ color: t.primary }}>  you</Text> : null}
      </Text>
      <RankBadge tier={tier} sportId={sportId} />
      {accuracy != null ? (
        <Text style={[styles.acc, { color: t.mutedText }]}>{Math.round(accuracy * 100)}%</Text>
      ) : null}
      <Text style={[styles.pts, { color: t.text }]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rank: { width: 26, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  name: { flex: 1, fontSize: 14, fontWeight: "700" },
  acc: { width: 42, textAlign: "right", fontSize: 12, fontVariant: ["tabular-nums"] },
  pts: { width: 48, textAlign: "right", fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
