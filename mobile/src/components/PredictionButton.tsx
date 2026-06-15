import React from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
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

  const styleFor = (): { bg: string; border: string; fg: string } => {
    switch (state) {
      case "selected":
        return { bg: t.primary, border: t.primary, fg: t.text };
      case "correct":
        return { bg: t.success, border: t.success, fg: "#06210F" };
      case "wrong":
        return { bg: "transparent", border: t.danger, fg: t.danger };
      case "disabled":
        return { bg: "transparent", border: t.border, fg: t.mutedText };
      default:
        return { bg: t.surfaceAlt, border: t.border, fg: t.text };
    }
  };
  const s = styleFor();
  const containerStyle: ViewStyle = { backgroundColor: s.bg, borderColor: s.border };

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
  btn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 8, alignItems: "center" },
  label: { fontSize: 13, fontWeight: "700" },
  strike: { textDecorationLine: "line-through" },
});
