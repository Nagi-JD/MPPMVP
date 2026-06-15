import React from "react";
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { glow } from "@/theme/shadow";

/** Base themed surface used by every other card. */
export function SportCard({
  children,
  sportId,
  onPress,
  style,
  highlighted,
}: {
  children: React.ReactNode;
  sportId?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
}) {
  const t = useSportTheme(sportId);
  const base: ViewStyle = {
    backgroundColor: t.surface,
    borderColor: highlighted ? t.primary : t.border,
    borderWidth: highlighted ? 1.5 : StyleSheet.hairlineWidth,
    ...(highlighted ? glow(t.primary, 0.4) : null),
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, base, pressed && { backgroundColor: t.surfaceAlt }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16 },
});
