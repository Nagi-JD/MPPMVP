import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

export function RewardCard({
  icon,
  name,
  desc,
  locked = true,
  sportId,
}: {
  icon: string;
  name: string;
  desc: string;
  locked?: boolean;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderColor: locked ? t.border : t.primary }]}>
      {locked ? (
        <Text style={[styles.tag, { color: t.mutedText, borderColor: t.border }]}>SOON</Text>
      ) : null}
      <Text style={[styles.icon, { opacity: locked ? 0.55 : 1 }]}>{icon}</Text>
      <Text style={[styles.name, { color: t.text }]}>{name}</Text>
      <Text style={[styles.desc, { color: t.mutedText }]}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 16, minHeight: 124 },
  tag: { position: "absolute", top: 10, right: 10, fontFamily: FONTS.monoBold, fontSize: 9, letterSpacing: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, overflow: "hidden" },
  icon: { fontSize: 26 },
  name: { fontFamily: FONTS.display, fontSize: 14, marginTop: 10 },
  desc: { fontFamily: FONTS.body, fontSize: 12, marginTop: 3 },
});
