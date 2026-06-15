import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  ScreenHeader,
  SportTabs,
  RankBadge,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
} from "@/components";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { getCategoryTheme, resolveCategory } from "@/theme/categories";
import { useCategory } from "@/theme/ThemeProvider";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, LeaderboardRow } from "@/lib/types";

export default function LeaderboardScreen() {
  const { userId, favorites } = useSession();
  const provider = getProvider();
  const { setCategory } = useCategory();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
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
    if (visible.length && !visible.some((l) => l.id === active)) {
      setActive(visible[0].id);
    }
  }, [visible, active]);

  useEffect(() => {
    if (active) setCategory(resolveCategory(active));
  }, [active, setCategory]);

  const reload = useCallback(() => {
    if (!active) return;
    setLoading(true);
    setError(false);
    provider
      .leaderboard(active)
      .then((r) => setRows(r))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [active, provider]);

  useEffect(() => {
    reload();
  }, [reload]);

  const accent = getCategoryTheme(active).accent;
  const activeLeague = visible.find((l) => l.id === active);
  const subtitle = activeLeague ? `${activeLeague.org} · ${activeLeague.season}` : undefined;

  const header = (
    <View>
      <ScreenHeader title="Classement" subtitle={subtitle} />
      <SportTabs
        tabs={visible.map((l) => ({
          id: l.id,
          label: l.org,
          accent: getCategoryTheme(l.id).accent,
        }))}
        activeId={active}
        onChange={setActive}
      />
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderRow = (item: LeaderboardRow, index: number) => {
    const me = item.user.id === userId;
    const rank = index + 1;
    const rankColor =
      rank === 1 ? accent : rank <= 3 ? COLORS.textMuted : COLORS.textFaint;
    return (
      <View key={item.user.id}>
        {index > 0 ? <Hairline /> : null}
        <View style={[styles.row, me && styles.meRow]}>
          {me ? <View style={[styles.meMarker, { backgroundColor: accent }]} /> : null}
          <Text style={[styles.rank, { color: rankColor }]}>
            {String(rank).padStart(2, "0")}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.user.displayName}
            {me ? <Text style={[styles.you, { color: accent }]}>  vous</Text> : null}
          </Text>
          <RankBadge tier={item.tier} />
          <Text style={styles.acc}>{Math.round(item.accuracy * 100)}%</Text>
          <Text style={styles.pts}>{item.points}</Text>
        </View>
      </View>
    );
  };

  // Loading: header + 6 skeleton rows.
  if (loading) {
    return (
      <View style={styles.root}>
        {header}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.skeletonRow}>
                <LoadingSkeleton height={52} radius={RADIUS.sm} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Error: header + retryable error state.
  if (error) {
    return (
      <View style={styles.root}>
        {header}
        <ErrorState message="Impossible de charger le classement." onRetry={reload} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {header}
      <View style={styles.cardWrap}>
        {rows.length === 0 ? (
          <View style={styles.card}>
            <EmptyState
              title="Aucun classement"
              message="Pas encore de résultats cette saison."
            />
          </View>
        ) : (
          <View style={styles.card}>{rows.map(renderRow)}</View>
        )}
      </View>
    </ScrollView>
  );
}

function Hairline() {
  return <View style={styles.hairline} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
  content: { paddingBottom: 32 },
  cardWrap: { paddingHorizontal: 16 },
  headerSpacer: { height: 14 },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  skeletonRow: { paddingHorizontal: 12, paddingVertical: 6 },
  hairline: { height: 1, backgroundColor: COLORS.border },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
  },
  meRow: { backgroundColor: COLORS.surfaceAlt },
  meMarker: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  rank: { width: 26, fontFamily: FONTS.monoBold, fontSize: 14 },
  name: { flex: 1, fontFamily: FONTS.bodyMed, fontSize: 14, color: COLORS.text },
  you: { fontFamily: FONTS.bodyMed, fontSize: 11 },
  acc: { width: 44, textAlign: "right", fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted },
  pts: { width: 44, textAlign: "right", fontFamily: FONTS.monoBold, fontSize: 14, color: COLORS.text },
});
