import React, { useEffect } from "react";
import { View, StyleSheet, type DimensionValue, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS, RADIUS } from "@/theme/tokens";

interface Props {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}

/** Shimmer block used instead of spinners. */
export function LoadingSkeleton({ width = "100%", height = 16, radius = RADIUS.sm, style }: Props) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.35,
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: COLORS.surfaceAlt }, animatedStyle, style]}
    />
  );
}

/** Stacked skeleton lines/blocks for a card placeholder. */
export function SkeletonGroup({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.group, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton key={i} width={i === lines - 1 ? "60%" : "100%"} height={14} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
});
