import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { timeUntil } from "@/lib/time";
import { SportLogo } from "@/components/SportLogo";
import { MarketRow } from "@/components/MarketRow";
import { getCategoryTheme } from "@/theme/categories";
import type { FixtureBoard } from "@/lib/data/provider";
import type { Prediction } from "@/lib/types";

export function FixtureCard({
  board,
  predictions,
  onSubmit,
}: {
  board: FixtureBoard;
  predictions: Prediction[];
  onSubmit: (marketId: string, value: string) => Promise<void>;
}) {
  const { fixture, markets } = board;
  const accent = getCategoryTheme(fixture.leagueId).accent;
  const settled = fixture.status === "settled";
  const countdown = timeUntil(fixture.lockTime);
  const byMarket = (id: string) => predictions.find((p) => p.marketId === id);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (settled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [settled, pulse]);

  const scopeLabel = fixture.scope === "season" ? "Season" : fixture.scope === "weekend" ? "Race weekend" : "Match";

  return (
    <View style={styles.card}>
      <LinearGradient colors={[accent + "26", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headRow}>
          <View style={styles.scopeWrap}>
            <SportLogo sport={fixture.sport} size={18} />
            <Text style={[styles.scope, { color: accent }]}>{scopeLabel.toUpperCase()}</Text>
          </View>
          {settled ? (
            <Text style={styles.settled}>SETTLED</Text>
          ) : (
            <View style={styles.live}>
              <Animated.View style={[styles.dot, { opacity: pulse }]} />
              <Text style={styles.countdown}>{countdown === "Locked" ? "LOCKED" : countdown}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{fixture.title}</Text>
        {fixture.venue ? <Text style={styles.venue}>{fixture.venue}</Text> : null}
      </LinearGradient>

      <View style={styles.markets}>
        {markets.map((m) => (
          <MarketRow key={m.id} market={m} sport={fixture.sport} accent={accent} existing={byMarket(m.id)} onSubmit={(v) => onSubmit(m.id, v)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderRadius: RADIUS["2xl"], borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.8)" },
  header: { paddingHorizontal: 16, paddingVertical: 14 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scopeWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  scope: { fontFamily: FONTS.monoBold, fontSize: 11, letterSpacing: 1 },
  settled: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1, color: "rgba(168,159,201,0.7)" },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.lime },
  countdown: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.violetLight },
  title: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.white, marginTop: 8 },
  venue: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted, marginTop: 2 },
  markets: { padding: 12, gap: 8 },
});
