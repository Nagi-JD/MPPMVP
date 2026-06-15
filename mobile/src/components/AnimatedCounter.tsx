import React, { useEffect, useState } from "react";
import { Text, StyleSheet, type TextStyle } from "react-native";
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

interface Props {
  value: number;
  style?: TextStyle;
}

/** Animates the displayed integer from its previous value to `value`. */
export function AnimatedCounter({ value, style }: Props) {
  const progress = useSharedValue(value);
  const [display, setDisplay] = useState(Math.round(value));

  useEffect(() => {
    progress.value = withTiming(value, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [value, progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplay)(current);
      }
    },
    [],
  );

  return <Text style={[styles.text, style]}>{display}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.monoBold,
    fontSize: 18,
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
  },
});
