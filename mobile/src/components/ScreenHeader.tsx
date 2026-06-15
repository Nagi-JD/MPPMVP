import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

/** Premium static header. Respects safe-area top. */
export function ScreenHeader({ title, subtitle, right }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.textCol}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.bg,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: COLORS.text,
  },
  right: {
    marginLeft: 16,
  },
});
