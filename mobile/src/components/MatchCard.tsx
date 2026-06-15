import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { Check, Clock } from "lucide-react-native";
import { COLORS, RADIUS, SHADOW } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { getCategoryTheme } from "@/theme/categories";
import { timeUntil } from "@/lib/time";
import type { Prediction } from "@/lib/types";
import type { FixtureBoard } from "@/lib/data/provider";
import { PredictionButton, type PredictionButtonState } from "./PredictionButton";
import { StatusBadge, type BadgeStatus } from "./StatusBadge";
import { MarketRow } from "./MarketRow";
import { hapticSelection, hapticSuccess } from "./haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCOPE_LABEL: Record<string, string> = {
  match: "Match",
  weekend: "Race weekend",
  season: "Season",
};

const STATUS_MAP: Record<string, BadgeStatus> = {
  scheduled: "upcoming",
  locked: "locked",
  settled: "final",
};

interface Props {
  board: FixtureBoard;
  predictions: Prediction[];
  onSubmit: (marketId: string, value: string) => Promise<void>;
}

function MatchCardBase({ board, predictions, onSubmit }: Props) {
  const { fixture, markets } = board;
  const accent = getCategoryTheme(fixture.leagueId).accent;

  const winner = useMemo(
    () => markets.find((m) => m.kind === "match_winner"),
    [markets],
  );
  const otherMarkets = useMemo(
    () => markets.filter((m) => m.kind !== "match_winner"),
    [markets],
  );

  const mine = useMemo(
    () => (winner ? predictions.find((p) => p.marketId === winner.id) : undefined),
    [predictions, winner],
  );

  const [pending, setPending] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const winnerOptions = useMemo(() => {
    if (!winner) return [] as string[];
    if (winner.options && winner.options.length) return winner.options;
    return [fixture.home, fixture.away].filter(Boolean) as string[];
  }, [winner, fixture.home, fixture.away]);

  const winnerLocked =
    !!winner &&
    (winner.status === "locked" ||
      new Date(winner.lockTime).getTime() <= Date.now());
  const winnerSettled = winner?.status === "settled";

  const buttonState = useCallback(
    (option: string): PredictionButtonState => {
      if (!winner) return "idle";
      if (winnerSettled) {
        if (option === winner.result) return "correct";
        if (mine?.value === option) return "wrong";
        return "locked";
      }
      if (winnerLocked) return "locked";
      const active = pending ?? mine?.value;
      if (active === option) {
        return option === mine?.value ? "confirmed" : "selected";
      }
      return "idle";
    },
    [winner, winnerSettled, winnerLocked, pending, mine?.value],
  );

  const onTapOption = useCallback(
    (option: string) => {
      if (winnerLocked || winnerSettled) return;
      hapticSelection();
      setPending(option === mine?.value ? null : option);
    },
    [winnerLocked, winnerSettled, mine?.value],
  );

  const showConfirm = !!pending && pending !== mine?.value && !winnerLocked && !winnerSettled;

  const onConfirm = useCallback(async () => {
    if (!winner || !pending || saving) return;
    setSaving(true);
    hapticSuccess();
    try {
      await onSubmit(winner.id, pending);
      setPending(null);
    } finally {
      setSaving(false);
    }
  }, [winner, pending, saving, onSubmit]);

  // Confirm CTA press spring
  const ctaScale = useSharedValue(1);
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const badgeStatus = STATUS_MAP[fixture.status] ?? "upcoming";
  const countdown = timeUntil(fixture.lockTime);
  const scopeLabel = SCOPE_LABEL[fixture.scope] ?? fixture.scope;
  const isTeamFixture = !!fixture.home && !!fixture.away;

  const possiblePts = winner ? winner.difficulty * 10 : 0;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.scope}>{scopeLabel.toUpperCase()}</Text>
        <StatusBadge status={badgeStatus} accent={accent} label={countdown} />
      </View>

      {/* Main row */}
      <View style={styles.mainRow}>
        {isTeamFixture ? (
          <View style={styles.teams}>
            <Text style={styles.team} numberOfLines={1}>
              {fixture.home}
            </Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={[styles.team, styles.teamRight]} numberOfLines={1}>
              {fixture.away}
            </Text>
          </View>
        ) : (
          <Text style={styles.title} numberOfLines={2}>
            {fixture.title}
          </Text>
        )}
      </View>

      {/* Winner section */}
      {winner ? (
        <View style={styles.winnerSection}>
          <Text style={styles.miniLabel}>WINNER</Text>
          <View style={styles.winnerRow}>
            {winnerOptions.map((opt) => (
              <PredictionButton
                key={opt}
                label={opt}
                state={buttonState(opt)}
                accent={accent}
                onPress={() => onTapOption(opt)}
              />
            ))}
          </View>

          {showConfirm ? (
            <AnimatedPressable
              onPress={onConfirm}
              onPressIn={() => {
                ctaScale.value = withSpring(0.97, { damping: 18, stiffness: 320, mass: 0.6 });
              }}
              onPressOut={() => {
                ctaScale.value = withSpring(1, { damping: 18, stiffness: 320, mass: 0.6 });
              }}
              disabled={saving}
              accessibilityRole="button"
              style={[styles.confirmCta, { backgroundColor: accent, opacity: saving ? 0.5 : 1 }, ctaStyle]}
            >
              <Check size={16} color="#0A0A0C" strokeWidth={3} />
              <Text style={styles.confirmText}>{mine ? "Modifier" : "Confirmer"}</Text>
            </AnimatedPressable>
          ) : null}
        </View>
      ) : null}

      {/* Other markets */}
      {otherMarkets.length ? (
        <View style={styles.otherSection}>
          <View style={styles.divider} />
          <View style={styles.marketList}>
            {otherMarkets.map((m) => (
              <MarketRow
                key={m.id}
                market={m}
                sport={fixture.sport}
                accent={accent}
                existing={predictions.find((p) => p.marketId === m.id)}
                onSubmit={(v) => onSubmit(m.id, v)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Clock size={12} color={COLORS.textMuted} strokeWidth={2.2} />
          <Text style={styles.footerText}>{timeUntil(fixture.lockTime)}</Text>
        </View>
        {winner ? <Text style={styles.footerText}>≤ {possiblePts} pts</Text> : null}
        <Text
          style={[
            styles.footerText,
            { color: mine ? COLORS.lime : COLORS.textFaint },
          ]}
        >
          {mine ? "Pronostic enregistré" : "Non pronostiqué"}
        </Text>
      </View>
    </View>
  );
}

export const MatchCard = React.memo(MatchCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    ...SHADOW,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scope: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: COLORS.textMuted,
  },
  mainRow: {
    paddingVertical: 2,
  },
  teams: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  team: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.text,
  },
  teamRight: {
    textAlign: "right",
  },
  vs: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 19,
    color: COLORS.text,
  },
  winnerSection: {
    gap: 8,
  },
  miniLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 1.6,
    color: COLORS.textFaint,
  },
  winnerRow: {
    flexDirection: "row",
    gap: 8,
  },
  confirmCta: {
    minHeight: 44,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: "#0A0A0C",
    letterSpacing: 0.3,
  },
  otherSection: {
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  marketList: {
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
