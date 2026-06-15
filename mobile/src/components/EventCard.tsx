import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import { SportCard } from "./SportCard";
import type { FixtureStatus } from "@/types";

export function EventCard({
  title,
  scopeLabel,
  countdown,
  status,
  sportId,
  children,
}: {
  title: string;
  scopeLabel: string;
  countdown?: string;
  status: FixtureStatus;
  sportId?: string;
  children?: React.ReactNode;
}) {
  const t = useSportTheme(sportId);
  const settled = status === "settled";
  return (
    <SportCard sportId={sportId} style={{ padding: 0, overflow: "hidden" }}>
      <LinearGradient
        colors={[t.primary + "26", t.surfaceAlt + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { borderBottomColor: t.border }]}
      >
        <View style={styles.headRow}>
          <Text style={[styles.scope, { color: t.primary }]}>{scopeLabel.toUpperCase()}</Text>
          {settled ? (
            <Text style={[styles.status, { color: t.mutedText }]}>SETTLED</Text>
          ) : (
            <View style={styles.live}>
              <View style={[styles.dot, { backgroundColor: t.success }]} />
              <Text style={[styles.status, { color: t.accent }]}>{countdown ?? ""}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      </LinearGradient>
      {children ? <View style={styles.body}>{children}</View> : null}
    </SportCard>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scope: { fontFamily: FONTS.monoBold, fontSize: 11, letterSpacing: 1.5 },
  status: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1 },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontFamily: FONTS.display, fontSize: 19, marginTop: 8, letterSpacing: -0.3 },
  body: { padding: 12, gap: 10 },
});
