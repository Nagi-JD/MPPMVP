import React from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import { glow } from "@/theme/shadow";
import type { PredictionState } from "@/types";

export function PredictionButton({
  label,
  state = "idle",
  onPress,
  sportId,
}: {
  label: string;
  state?: PredictionState;
  onPress?: () => void;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);

  const look = (): { bg: string; border: string; fg: string; glowed: boolean } => {
    switch (state) {
      case "selected":
        return { bg: t.primary, border: t.primary, fg: "#fff", glowed: true };
      case "correct":
        return { bg: t.success, border: t.success, fg: "#06210F", glowed: true };
      case "wrong":
        return { bg: "transparent", border: t.danger, fg: t.danger, glowed: false };
      case "disabled":
        return { bg: "transparent", border: t.border, fg: t.mutedText, glowed: false };
      default:
        return { bg: t.surfaceAlt, border: t.border, fg: t.text, glowed: false };
    }
  };
  const s = look();
  const containerStyle: ViewStyle = {
    backgroundColor: s.bg,
    borderColor: s.border,
    ...(s.glowed ? glow(s.border, 0.5) : null),
  };

  return (
    <Pressable
      disabled={state === "disabled" || state === "correct" || state === "wrong"}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, containerStyle, pressed && state === "idle" && { opacity: 0.85 }]}
    >
      <Text style={[styles.label, { color: s.fg }, state === "wrong" && styles.strike]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" },
  label: { fontFamily: FONTS.bodyMed, fontSize: 13 },
  strike: { textDecorationLine: "line-through" },
});
