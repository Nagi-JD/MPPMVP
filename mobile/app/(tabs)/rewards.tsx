import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import {
  Target,
  Flame,
  CircleDot,
  Gauge,
  Crown,
  Users,
  Lock,
  type LucideIcon,
} from "lucide-react-native";
import { ScreenHeader } from "@/components";
import { COLORS, RADIUS, SHADOW } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

type Badge = { Icon: LucideIcon; name: string; desc: string; tone: string };

const BADGES: Badge[] = [
  { Icon: Target, name: "Sharp Shooter", desc: "80%+ de précision sur une saison", tone: COLORS.lime },
  { Icon: Flame, name: "Série chaude", desc: "10 pronostics corrects d'affilée", tone: COLORS.amber },
  { Icon: CircleDot, name: "Vision de jeu", desc: "Trouver un score exact NBA", tone: "#F2641E" },
  { Icon: Gauge, name: "Pole position", desc: "Podium qualifs parfait", tone: "#E10600" },
  { Icon: Crown, name: "Oracle", desc: "Désigner un champion de saison", tone: COLORS.text },
  { Icon: Users, name: "Boss de ligue", desc: "Gagner une mini-ligue privée", tone: COLORS.text },
];

export default function RewardsScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Rewards" subtitle="Bientôt disponible" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Gagne des badges et grimpe dans les paliers de saison. Fierté sociale uniquement — jamais
          d'argent réel.
        </Text>

        <Text style={styles.microLabel}>BADGES À DÉBLOQUER</Text>
        <View style={styles.grid}>
          {BADGES.map((b) => (
            <View key={b.name} style={styles.cell}>
              <View style={styles.badge}>
                <View style={styles.soonPill}>
                  <Text style={styles.soonText}>SOON</Text>
                </View>
                <b.Icon size={24} color={b.tone} strokeWidth={2} />
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.microLabel}>PRIX DE SAISON</Text>
        <View style={styles.prizeCard}>
          <Text style={styles.prizeTitle}>En haut du tableau, en haut des récompenses.</Text>
          <Text style={styles.prizeDesc}>
            Termine la saison bien classé pour débloquer des badges exclusifs et du flair de profil.
            Un palier premium avec stats avancées est prévu.
          </Text>
          <View style={styles.premiumBtn} accessibilityState={{ disabled: true }}>
            <Lock size={16} color={COLORS.textFaint} strokeWidth={2} />
            <Text style={styles.premiumText}>Premium — bientôt</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  intro: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 19, color: COLORS.textMuted },
  microLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textFaint,
    marginTop: 28,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  cell: { width: "50%", padding: 6 },
  badge: {
    position: "relative",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    minHeight: 128,
    ...SHADOW,
  },
  soonPill: {
    position: "absolute",
    top: 10,
    right: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  soonText: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1, color: COLORS.textFaint },
  badgeName: { fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.text, marginTop: 12 },
  badgeDesc: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 16, color: COLORS.textMuted, marginTop: 4 },
  prizeCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 20,
    ...SHADOW,
  },
  prizeTitle: { fontFamily: FONTS.display, fontSize: 19, color: COLORS.text, letterSpacing: -0.3 },
  prizeDesc: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 20, color: COLORS.textMuted, marginTop: 8 },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
  },
  premiumText: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.textFaint },
});
