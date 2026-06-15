import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import {
  ScreenHeader,
  SportTabs,
  MatchCard,
  PointsSummary,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
} from "@/components";
import { COLORS, RADIUS } from "@/theme/tokens";
import { getCategoryTheme, resolveCategory } from "@/theme/categories";
import { useCategory } from "@/theme/ThemeProvider";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { FixtureBoard } from "@/lib/data/provider";
import type { League, Prediction, SeasonStats } from "@/lib/types";

export default function HomeScreen() {
  const { userId, favorites } = useSession();
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
    [leagues, favorites],
  );

  useEffect(() => {
    if (visible.length && !visible.some((l) => l.id === activeLeague)) {
      setActiveLeague(visible[0].id);
    }
  }, [visible, activeLeague]);

  // Only the FOCUSED screen drives the global category accent — prevents
  // background tabs from fighting over it (which made the nav icons flicker).
  useFocusEffect(
    useCallback(() => {
      if (activeLeague) setCategory(resolveCategory(activeLeague));
    }, [activeLeague, setCategory])
  );

  const reload = useCallback(() => {
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
        setBoard(b);
        setPreds(p);
        setStats(s);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeLeague, userId, provider]);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = useCallback(
    async (marketId: string, value: string) => {
      await provider.submitPrediction(userId, marketId, value);
      setPreds(await provider.getPredictions(userId));
    },
    [provider, userId],
  );

  const renderItem = useCallback(
    ({ item }: { item: FixtureBoard }) => (
      <MatchCard board={item} predictions={preds} onSubmit={submit} />
    ),
    [preds, submit],
  );

  const keyExtractor = useCallback((b: FixtureBoard) => b.fixture.id, []);

  const accent = getCategoryTheme(activeLeague).accent;
  const active = visible.find((l) => l.id === activeLeague);
  const subtitle = active ? `${active.org} · ${active.season}` : undefined;

  const header = (
    <View>
      <ScreenHeader
        title="Matchday"
        subtitle={subtitle}
        right={
          stats ? (
            <PointsSummary points={stats.points} accuracy={stats.accuracy * 100} accent={accent} />
          ) : undefined
        }
      />
      <SportTabs
        tabs={visible.map((l) => ({
          id: l.id,
          label: l.org,
          accent: getCategoryTheme(l.id).accent,
        }))}
        activeId={activeLeague}
        onChange={setActiveLeague}
      />
      <View style={styles.headerSpacer} />
    </View>
  );

  // Loading: header + 3 skeleton cards (no spinner).
  if (loading) {
    return (
      <View style={styles.root}>
        {header}
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <LoadingSkeleton height={120} radius={RADIUS.lg} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Error: header + retryable error state.
  if (error) {
    return (
      <View style={styles.root}>
        {header}
        <ErrorState
          message="Impossible de charger les matchs. Backend lancé ?"
          onRetry={reload}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      data={board}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ItemSeparatorComponent={Spacer}
      ListEmptyComponent={
        <EmptyState title="Aucun match" message="Rien à pronostiquer pour l’instant." />
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

function Spacer() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  headerSpacer: { height: 14 },
  separator: { height: 14 },
  skeletonList: { paddingHorizontal: 16, gap: 14 },
  skeletonCard: { borderRadius: RADIUS.lg, overflow: "hidden" },
});
