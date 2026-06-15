import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSportControls, useSportTheme } from "@/theme/useSportTheme";
import { getSportTheme, resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { timeUntil } from "@/lib/time";
import { SportHeader, EventCard, PredictionCard, PredictionButton, ResultCard, RankBadge } from "@/components";
import type { FixtureBoard } from "@/lib/data/provider";
import type { League, Prediction, SeasonStats } from "@/lib/types";

export default function HomeScreen() {
  const t = useSportTheme();
  const { setSport } = useSportControls();
  const { userId, favorites } = useSession();
  const provider = getProvider();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeague, setActiveLeague] = useState("");
  const [board, setBoard] = useState<FixtureBoard[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    provider.listLeagues().then(setLeagues).catch((e) => setError(String(e)));
  }, [provider]);

  const visible = useMemo(
    () => leagues.filter((l) => favorites.length === 0 || favorites.includes(l.sport)),
    [leagues, favorites]
  );

  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === activeLeague)) setActiveLeague(visible[0].id);
  }, [visible, activeLeague]);

  useEffect(() => {
    if (activeLeague) setSport(resolveSportId(activeLeague));
  }, [activeLeague, setSport]);

  useEffect(() => {
    if (!activeLeague) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [b, p, s] = await Promise.all([
          provider.getBoard(activeLeague),
          provider.getPredictions(userId),
          provider.seasonStats(userId, activeLeague),
        ]);
        setBoard(b); setPreds(p); setStats(s);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [activeLeague, userId, provider]);

  async function submit(marketId: string, value: string) {
    await provider.submitPrediction(userId, marketId, value);
    setPreds(await provider.getPredictions(userId));
  }

  const predFor = (marketId: string) => preds.find((p) => p.marketId === marketId);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Match Day" subtitle="Call it before the lights go out." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {visible.map((l) => {
          const on = l.id === activeLeague;
          const st = getSportTheme(resolveSportId(l.id));
          return (
            <Pressable
              key={l.id}
              onPress={() => setActiveLeague(l.id)}
              style={[styles.chip, { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary + "22" : "transparent" }]}
            >
              <Text style={{ color: on ? t.text : t.mutedText, fontFamily: FONTS.bodyMed, fontSize: 13 }}>
                {l.org} {l.season}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {stats && (
        <View style={[styles.banner, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <RankBadge tier={stats.tier} />
            <Text style={{ color: t.mutedText, fontFamily: FONTS.mono, fontSize: 12 }}>
              {stats.correct}/{stats.settled} correct · {Math.round(stats.accuracy * 100)}%
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: t.accent, fontFamily: FONTS.monoBold, fontSize: 18 }}>{stats.points}</Text>
            <Text style={{ color: t.mutedText, fontFamily: FONTS.mono, fontSize: 10 }}>SEASON PTS</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: t.danger }]}>Couldn't load the board. Is the backend running?</Text>
      ) : board.length === 0 ? (
        <Text style={[styles.empty, { color: t.mutedText }]}>No fixtures on the board yet.</Text>
      ) : (
        board.map((b) => (
          <View key={b.fixture.id} style={styles.section}>
            <EventCard
              title={b.fixture.title}
              scopeLabel={b.fixture.scope === "match" ? "Match" : b.fixture.scope === "weekend" ? "Race weekend" : "Season"}
              countdown={timeUntil(b.fixture.lockTime)}
              status={b.fixture.status}
            >
              {b.markets.map((m) => {
                const settled = m.status === "settled";
                const mine = predFor(m.id);
                if (settled) {
                  return (
                    <ResultCard
                      key={m.id}
                      marketLabel={m.label}
                      result={m.result ?? "—"}
                      correct={mine ? mine.value === m.result : undefined}
                      points={mine?.pointsAwarded}
                    />
                  );
                }
                return (
                  <PredictionCard
                    key={m.id}
                    label={m.label}
                    difficulty={m.difficulty}
                    lockedLabel={mine ? `Locked: ${mine.value}` : undefined}
                  >
                    {(m.options ?? []).map((o) => (
                      <PredictionButton
                        key={o}
                        label={o}
                        state={mine?.value === o ? "selected" : "idle"}
                        onPress={() => submit(m.id, o)}
                      />
                    ))}
                  </PredictionCard>
                );
              })}
            </EventCard>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  banner: { marginHorizontal: 20, marginBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  section: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
