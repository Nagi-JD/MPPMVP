import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { TIER_COLOR } from "@/lib/catalog";
import type { RankTier } from "@/lib/types";

/** Tier pill (web RankBadge). */
export function RankBadge({ tier }: { tier: RankTier; sportId?: string }) {
  return (
    <View style={styles.badge}>
      <Text style={[styles.text, { color: TIER_COLOR[tier] }]}>{tier.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
    backgroundColor: COLORS.ink,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: { fontFamily: FONTS.monoBold, fontSize: 10, letterSpacing: 1.2 },
});
