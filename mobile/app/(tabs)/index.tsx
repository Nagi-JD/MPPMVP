import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Eyebrow, SportLogo, RankBadge, FixtureCard } from "@/components";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { getCategoryTheme, resolveCategory } from "@/theme/categories";
import { useCategory } from "@/theme/ThemeProvider";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { FixtureBoard } from "@/lib/data/provider";
import type { League, Prediction, SeasonStats } from "@/lib/types";

export default function HomeScreen() {
  const { userId, displayName, favorites } = useSession();
  const provider = getProvider();
  const { setCategory } = useCategory();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeague, setActiveLeague] = useState("");
  const [board, setBoard] = useState<FixtureBoard[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    provider.listLeagues().then(setLeagues).catch(() => setError(true));
  }, [provider]);

  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );

  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === activeLeague)) setActiveLeague(visible[0].id);
  }, [visible, activeLeague]);

  useEffect(() => {
    if (activeLeague) setCategory(resolveCategory(activeLeague));
  }, [activeLeague, setCategory]);

  useEffect(() => {
    if (!activeLeague) return;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          provider.getBoard(activeLeague),
          provider.getPredictions(userId),
          provider.seasonStats(userId, activeLeague),
        ]);
        setBoard(b); setPreds(p); setStats(s);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeLeague, userId, provider]);

  async function submit(marketId: string, value: string) {
    await provider.submitPrediction(userId, marketId, value);
    setPreds(await provider.getPredictions(userId));
  }

  const firstName = displayName.split(" ")[0];
  const titleAccent = getCategoryTheme(activeLeague).accent;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Eyebrow>Match day</Eyebrow>
        <Text style={styles.title}>
          Call it, <Text style={{ color: titleAccent }}>{firstName}</Text>.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {visible.map((l) => {
          const accent = getCategoryTheme(l.id).accent;
          const on = l.id === activeLeague;
          return (
            <Pressable key={l.id} onPress={() => setActiveLeague(l.id)}
              style={[styles.chip, { borderColor: on ? accent : COLORS.line, backgroundColor: on ? "rgba(255,255,255,0.05)" : "transparent" }]}>
              <SportLogo sport={l.sport} size={14} />
              <Text style={{ color: on ? COLORS.white : COLORS.muted, fontFamily: FONTS.bodyMed, fontSize: 13 }}>{l.org} {l.season}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {stats && (
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <RankBadge tier={stats.tier} />
            <Text style={styles.bannerStat}>{stats.correct}/{stats.settled} correct · {Math.round(stats.accuracy * 100)}%</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.points}>{stats.points}</Text>
            <Text style={styles.pointsLabel}>SEASON PTS</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={COLORS.violet} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: COLORS.magenta }]}>Couldn't load the board. Is the backend running?</Text>
      ) : board.length === 0 ? (
        <Text style={styles.empty}>No fixtures on the board yet.</Text>
      ) : (
        <View style={styles.list}>
          {board.map((b) => (
            <FixtureCard key={b.fixture.id} board={b} predictions={preds} onSubmit={submit} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingTop: 28 },
  header: { paddingHorizontal: 20 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, marginTop: 8, letterSpacing: -0.5 },
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  banner: { marginHorizontal: 20, marginBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", paddingHorizontal: 16, paddingVertical: 12 },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  bannerStat: { color: COLORS.muted, fontFamily: FONTS.mono, fontSize: 12 },
  points: { color: COLORS.lime, fontFamily: FONTS.monoBold, fontSize: 18 },
  pointsLabel: { color: COLORS.muted, fontFamily: FONTS.mono, fontSize: 10 },
  list: { paddingHorizontal: 20, gap: 16, paddingTop: 4 },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted },
});
