import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS, RADIUS, GLOW } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { SPORTS } from "@/lib/catalog";
import { SportLogo, Eyebrow } from "@/components";
import type { Sport } from "@/lib/types";

const ALL: Sport[] = ["basketball", "f1"];
const SUBTITLE: Record<Sport, string> = {
  basketball: "NBA · EuroLeague · LNB",
  f1: "Grand Prix · Championship",
};

export function OnboardingModal({
  onDone,
  initial = ["basketball", "f1"],
  eyebrow = "Welcome to MPP+",
  title = "Pick your sports",
  ctaLabel = "Start predicting",
}: {
  onDone: (sports: Sport[]) => void;
  initial?: Sport[];
  eyebrow?: string;
  title?: string;
  ctaLabel?: string;
}) {
  const [picked, setPicked] = useState<Sport[]>(initial);
  const toggle = (s: Sport) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>We'll line up the leagues you care about. Change them anytime.</Text>

          <View style={styles.list}>
            {ALL.map((s) => {
              const meta = SPORTS[s];
              const on = picked.includes(s);
              return (
                <Pressable key={s} onPress={() => toggle(s)}
                  style={[styles.opt, { borderColor: on ? meta.accent : COLORS.line, backgroundColor: on ? "rgba(255,255,255,0.04)" : "transparent", opacity: on ? 1 : 0.7 }]}>
                  <SportLogo sport={s} size={28} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optName}>{meta.label}</Text>
                    <Text style={[styles.optSub, { color: meta.accent }]}>{SUBTITLE[s]}</Text>
                  </View>
                  <View style={[styles.check, { borderColor: on ? COLORS.lime : COLORS.line, backgroundColor: on ? COLORS.lime : "transparent" }]}>
                    <Text style={{ color: on ? COLORS.ink : "transparent", fontFamily: FONTS.bodyMed, fontSize: 12 }}>✓</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => onDone(picked)} style={styles.cta}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end", padding: 16 },
  card: { width: "100%", maxWidth: 448, alignSelf: "center", borderRadius: RADIUS["2xl"], borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink800, padding: 22, ...GLOW },
  title: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.white, marginTop: 8 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginTop: 4 },
  list: { marginTop: 20, gap: 12 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: RADIUS.xl, paddingHorizontal: 16, paddingVertical: 14 },
  optName: { fontFamily: FONTS.displayBold, fontSize: 15, color: COLORS.white },
  optSub: { fontFamily: FONTS.body, fontSize: 12, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cta: { marginTop: 24, backgroundColor: COLORS.violet, borderRadius: RADIUS.xl, paddingVertical: 14, alignItems: "center", ...GLOW },
  ctaText: { fontFamily: FONTS.displayBold, fontSize: 15, color: "#fff" },
});
