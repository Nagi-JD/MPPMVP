import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";

export function SportHeader({
  title,
  subtitle,
  sportId,
}: {
  title: string;
  subtitle?: string;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);
  return (
    <View style={[styles.wrap, { backgroundColor: t.background, borderBottomColor: t.border }]}>
      <View style={[styles.bar, { backgroundColor: t.primary }]} />
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: t.mutedText }]}>{t.name.toUpperCase()}</Text>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: t.mutedText }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 14 },
  bar: { width: 4, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  title: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  subtitle: { fontSize: 13, marginTop: 2 },
});
