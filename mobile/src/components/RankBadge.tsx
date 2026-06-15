import React from "react";
import { Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import type { RankTier } from "@/types";

export function RankBadge({ tier, sportId }: { tier: RankTier; sportId?: string }) {
  const t = useSportTheme(sportId);
  const color = (): string => {
    switch (tier) {
      case "Diamond": return t.accent;
      case "Platinum": return t.primary;
      case "Gold": return "#F4A800";
      case "Silver": return t.mutedText;
      case "Bronze": return "#C98A5E";
      default: return t.mutedText;
    }
  };
  return (
    <Text style={[styles.badge, { color: color(), borderColor: t.border, backgroundColor: t.background }]}>
      {tier.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    letterSpacing: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
});
