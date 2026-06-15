import React, { useCallback } from "react";
import { Text, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Check, Lock, X } from "lucide-react-native";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { hapticSelection } from "./haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PredictionButtonState =
  | "idle"
  | "selected"
  | "confirmed"
  | "locked"
  | "correct"
  | "wrong";

interface Props {
  label: string;
  state: PredictionButtonState;
  accent: string;
  onPress?: () => void;
  sublabel?: string;
}

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

/**
 * Premium selectable button with EXPLICIT visual states.
 * State is never conveyed by color alone — each state pairs with an icon and/or
 * label treatment for accessibility.
 */
export function PredictionButton({
  label,
  state,
  accent,
  onPress,
  sublabel,
}: Props) {
  const interactive =
    state !== "locked" && state !== "correct" && state !== "wrong";
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (!interactive) return;
    scale.value = withSpring(0.97, SPRING);
  }, [interactive, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (!interactive) return;
    hapticSelection();
    onPress?.();
  }, [interactive, onPress]);

  // ── Resolve per-state visuals ──────────────────────────────────────────────
  let containerStyle: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    opacity: number;
  } = {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    opacity: 1,
  };
  let textColor: string = COLORS.text;
  let textDecoration: "none" | "line-through" = "none";
  let icon: React.ReactNode = null;

  switch (state) {
    case "selected":
      containerStyle = {
        backgroundColor: accent + "1F",
        borderColor: accent,
        borderWidth: 1.5,
        opacity: 1,
      };
      textColor = COLORS.text;
      icon = <View style={[styles.dot, { backgroundColor: accent }]} />;
      break;
    case "confirmed":
      containerStyle = {
        backgroundColor: accent,
        borderColor: accent,
        borderWidth: 1.5,
        opacity: 1,
      };
      textColor = "#0A0A0C";
      icon = <Check size={16} color="#0A0A0C" strokeWidth={3} />;
      break;
    case "locked":
      containerStyle = {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        opacity: 0.6,
      };
      textColor = COLORS.textMuted;
      icon = <Lock size={14} color={COLORS.textMuted} strokeWidth={2.4} />;
      break;
    case "correct":
      containerStyle = {
        backgroundColor: COLORS.lime + "1F",
        borderColor: COLORS.lime,
        borderWidth: 1.5,
        opacity: 1,
      };
      textColor = COLORS.text;
      icon = <Check size={16} color={COLORS.lime} strokeWidth={3} />;
      break;
    case "wrong":
      containerStyle = {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        opacity: 1,
      };
      textColor = COLORS.textMuted;
      textDecoration = "line-through";
      icon = <X size={15} color={COLORS.textMuted} strokeWidth={2.6} />;
      break;
    case "idle":
    default:
      break;
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={!interactive}
      accessibilityRole="button"
      accessibilityState={{
        selected: state === "selected" || state === "confirmed",
        disabled: state === "locked",
      }}
      style={[styles.base, containerStyle, aStyle]}
    >
      {icon}
      <View style={styles.labels}>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            { color: textColor, textDecorationLine: textDecoration },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text numberOfLines={1} style={[styles.sublabel, { color: textColor }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  labels: {
    flexShrink: 1,
    alignItems: "center",
  },
  label: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  sublabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    opacity: 0.7,
    marginTop: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
