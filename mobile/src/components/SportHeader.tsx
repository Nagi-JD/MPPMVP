import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

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
    <View>
      {/* floodlight wash in the sport's colour */}
      <LinearGradient
        colors={[t.primary + "33", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={styles.wash}
      />
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: t.mutedText }]}>{t.name.toUpperCase()} · 2026</Text>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: t.mutedText }]}>{subtitle}</Text> : null}
        <View style={[styles.rule, { backgroundColor: t.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wash: { position: "absolute", top: 0, left: 0, right: 0, height: 160 },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 2 },
  title: { fontFamily: FONTS.display, fontSize: 30, marginTop: 6, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, marginTop: 4 },
  rule: { width: 40, height: 3, borderRadius: 2, marginTop: 12 },
});
