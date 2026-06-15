import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AlertTriangle, RotateCcw } from "lucide-react-native";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { hapticLight } from "./haptics";

interface Props {
  message?: string;
  onRetry?: () => void;
}

const SPRING = { damping: 18, stiffness: 180 };

/** Centered error message with optional retry button. */
export function ErrorState({ message = "Une erreur est survenue.", onRetry }: Props) {
  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      <AlertTriangle color={COLORS.amber} size={34} strokeWidth={1.6} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.96, SPRING);
          }}
          onPressOut={() => {
            scale.value = withSpring(1, SPRING);
          }}
          onPress={() => {
            hapticLight();
            onRetry();
          }}
          accessibilityRole="button"
        >
          <Animated.View style={[styles.button, btnStyle]}>
            <RotateCcw color={COLORS.text} size={15} strokeWidth={2} />
            <Text style={styles.buttonText}>Réessayer</Text>
          </Animated.View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 14,
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  buttonText: {
    fontFamily: FONTS.bodyMed,
    fontSize: 14,
    color: COLORS.text,
  },
});
