import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eyebrow } from "@/components";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

const BADGES: { icon: string; name: string; desc: string; tone: string }[] = [
  { icon: "🎯", name: "Sharp Shooter", desc: "80%+ accuracy over a season", tone: COLORS.lime },
  { icon: "🔥", name: "Hot Streak", desc: "10 correct calls in a row", tone: COLORS.amber },
  { icon: "🏀", name: "Court Vision", desc: "Nail an exact NBA score", tone: COLORS.amber },
  { icon: "🏎️", name: "Pole Sitter", desc: "Perfect qualifying podium", tone: COLORS.magenta },
  { icon: "👑", name: "Oracle", desc: "Call a season champion", tone: COLORS.violetLight },
  { icon: "🤝", name: "League Boss", desc: "Win a private mini-league", tone: COLORS.violetLight },
];

export default function RewardsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Eyebrow>Coming soon</Eyebrow>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.sub}>Earn badges, climb seasonal prize tiers, and unlock premium perks. Social bragging rights only — never real-money betting.</Text>

      <Eyebrow style={styles.section}>Badges to chase</Eyebrow>
      <View style={styles.grid}>
        {BADGES.map((b) => (
          <View key={b.name} style={styles.cell}>
            <View style={styles.badge}>
              <Text style={styles.soon}>SOON</Text>
              <Text style={[styles.icon, { color: b.tone }]}>{b.icon}</Text>
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Eyebrow style={styles.section}>Seasonal prizes</Eyebrow>
      <LinearGradient colors={["rgba(139,92,246,0.15)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.prizes}>
        <Text style={styles.prizeTitle}>Top of the table, top of the rewards.</Text>
        <Text style={styles.prizeDesc}>Finish each season highly ranked to earn exclusive badges and profile flair. Premium tier with deeper stats is on the roadmap.</Text>
        <View style={styles.premium}><Text style={styles.premiumText}>Premium — coming soon</Text></View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, marginTop: 8, letterSpacing: -0.5 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginTop: 4, marginBottom: 4 },
  section: { marginTop: 24, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  cell: { width: "50%", padding: 6 },
  badge: { position: "relative", borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: "rgba(21,17,42,0.6)", borderRadius: 20, padding: 16, minHeight: 120 },
  soon: { position: "absolute", top: 10, right: 10, fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1, color: "rgba(168,159,201,0.7)", borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, overflow: "hidden" },
  icon: { fontSize: 26 },
  badgeName: { fontFamily: FONTS.display, fontSize: 14, color: COLORS.white, marginTop: 10 },
  badgeDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted, marginTop: 3 },
  prizes: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, borderRadius: 20, padding: 20 },
  prizeTitle: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.white },
  prizeDesc: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginTop: 4 },
  premium: { marginTop: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  premiumText: { fontFamily: FONTS.displayBold, fontSize: 14, color: "rgba(168,159,201,0.7)" },
});
