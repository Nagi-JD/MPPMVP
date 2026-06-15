import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Eyebrow, SportLogo, RankBadge } from "@/components";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { SPORTS } from "@/lib/catalog";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, LeaderboardRow } from "@/lib/types";

const MEDAL = [COLORS.lime, COLORS.violetLight, COLORS.amber];

export default function LeaderboardScreen() {
  const { userId, favorites } = useSession();
  const provider = getProvider();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    provider.listLeagues().then(setLeagues).catch(() => {});
  }, [provider]);

  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );
  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === active)) setActive(visible[0].id);
  }, [visible, active]);

  useEffect(() => {
    if (active) provider.leaderboard(active).then(setRows).catch(() => setRows([]));
  }, [active, provider]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Eyebrow>Standings</Eyebrow>
      <Text style={styles.title}>Season Ranking</Text>
      <Text style={styles.sub}>Rank rewards accuracy, volume and difficulty per season.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {visible.map((l) => {
          const meta = SPORTS[l.sport];
          const on = l.id === active;
          return (
            <Pressable key={l.id} onPress={() => setActive(l.id)}
              style={[styles.chip, { borderColor: on ? meta.accent : COLORS.line, backgroundColor: on ? "rgba(255,255,255,0.05)" : "transparent" }]}>
              <SportLogo sport={l.sport} size={14} />
              <Text style={{ color: on ? COLORS.white : COLORS.muted, fontFamily: FONTS.bodyMed, fontSize: 13 }}>{l.org} {l.season}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.board}>
        {rows.length === 0 ? (
          <Text style={styles.empty}>No predictions resolved yet this season.</Text>
        ) : (
          rows.map((r, i) => {
            const me = r.user.id === userId;
            return (
              <View key={r.user.id} style={[styles.row, i > 0 && styles.rowBorder, me ? styles.meRow : i < 3 ? styles.topRow : null]}>
                <Text style={[styles.rank, { color: MEDAL[i] ?? COLORS.muted }]}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {r.user.displayName}
                  {me ? <Text style={styles.you}>  you</Text> : null}
                </Text>
                <RankBadge tier={r.tier} />
                <Text style={styles.acc}>{Math.round(r.accuracy * 100)}%</Text>
                <Text style={styles.pts}>{r.points}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, marginTop: 8, letterSpacing: -0.5 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginTop: 4, marginBottom: 16 },
  chips: { gap: 8, paddingVertical: 4, marginBottom: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  board: { overflow: "hidden", borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)" },
  empty: { padding: 24, textAlign: "center", fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.line },
  meRow: { backgroundColor: "rgba(139,92,246,0.10)" },
  topRow: { backgroundColor: "rgba(255,255,255,0.02)" },
  rank: { width: 26, fontFamily: FONTS.monoBold, fontSize: 14 },
  name: { flex: 1, fontFamily: FONTS.bodyMed, fontSize: 14, color: COLORS.white },
  you: { color: COLORS.violetLight, fontFamily: FONTS.body, fontSize: 11 },
  acc: { width: 44, textAlign: "right", fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted },
  pts: { width: 44, textAlign: "right", fontFamily: FONTS.monoBold, fontSize: 14, color: COLORS.white },
});
