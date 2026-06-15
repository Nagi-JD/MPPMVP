import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

export type BadgeStatus = "upcoming" | "live" | "locked" | "final";

const LIVE_RED = "#E10600";

interface Props {
  status: BadgeStatus;
  /** Optional accent override (e.g. for upcoming/time variants). */
  accent?: string;
  /** Optional label override (e.g. kickoff time for "upcoming"). */
  label?: string;
}

/** Compact status pill. Never relies on color alone — always shows text. */
export function StatusBadge({ status, accent, label }: Props) {
  if (status === "live") return <LiveBadge />;

  const text =
    label ??
    (status === "upcoming" ? "UPCOMING" : status === "locked" ? "LOCKED" : "FINAL");
  const color = status === "upcoming" && accent ? accent : COLORS.textMuted;

  return (
    <View style={styles.pill}>
      <Text style={[styles.label, { color }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

function LiveBadge() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 0.85 + pulse.value * 0.35 }],
  }));

  return (
    <View style={styles.pill}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text style={[styles.label, styles.liveLabel]}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceAlt,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LIVE_RED,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: COLORS.textMuted,
  },
  liveLabel: {
    color: LIVE_RED,
  },
});
