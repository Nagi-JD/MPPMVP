import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Eyebrow, SportLogo, RankBadge } from "@/components";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { getCategoryTheme } from "@/theme/categories";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, Profile, SeasonStats } from "@/lib/types";

export default function ProfileScreen() {
  const { userId, displayName } = useSession();
  const provider = getProvider();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [seasons, setSeasons] = useState<{ league: League; stats: SeasonStats }[]>([]);

  useEffect(() => {
    (async () => {
      setProfile(await provider.getProfile(userId));
      const leagues = await provider.listLeagues();
      const rows = await Promise.all(
        leagues.map(async (league) => ({ league, stats: await provider.seasonStats(userId, league.id) }))
      );
      setSeasons(rows.filter((r) => r.stats.made > 0));
    })().catch(() => {});
  }, [userId, provider]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.slice(0, 1)}</Text>
        </View>
        <View>
          <Eyebrow>Predictor</Eyebrow>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={{ marginLeft: "auto", alignItems: "flex-end" }}>
          <Text style={styles.total}>{profile?.totalPoints ?? 0}</Text>
          <Text style={styles.totalLabel}>total pts</Text>
        </View>
      </View>

      <Eyebrow style={styles.section}>Rank by season</Eyebrow>
      {seasons.length === 0 ? (
        <Text style={styles.emptyCard}>Make some predictions to start a seasonal rank.</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {seasons.map(({ league, stats }) => {
            const accent = getCategoryTheme(league.id).accent;
            return (
              <View key={league.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <SportLogo sport={league.sport} size={20} />
                  <Text style={styles.cardTitle}>{league.org} {league.season}</Text>
                  <View style={{ marginLeft: "auto" }}><RankBadge tier={stats.tier} /></View>
                </View>
                <View style={styles.cells}>
                  <Cell value={stats.points} label="Points" tone={COLORS.lime} />
                  <Cell value={`${Math.round(stats.accuracy * 100)}%`} label="Accuracy" tone={accent} />
                  <Cell value={`${stats.correct}/${stats.settled}`} label="Correct" tone={COLORS.white} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function Cell({ value, label, tone }: { value: number | string; label: string; tone: string }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.cellValue, { color: tone }]}>{value}</Text>
      <Text style={styles.cellLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(139,92,246,0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.violetLight },
  name: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.white },
  total: { fontFamily: FONTS.monoBold, fontSize: 24, color: COLORS.lime },
  totalLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted },
  section: { marginTop: 28, marginBottom: 8 },
  emptyCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, textAlign: "center", fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", borderRadius: 20, padding: 16 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.white },
  cells: { flexDirection: "row", gap: 8, marginTop: 12 },
  cell: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  cellValue: { fontFamily: FONTS.monoBold, fontSize: 18 },
  cellLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 2 },
});
