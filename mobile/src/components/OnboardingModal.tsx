import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";
import type { Sport } from "@/lib/types";

const SPORT_OPTIONS: { id: Sport; label: string; emoji: string }[] = [
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "f1", label: "Formula 1", emoji: "🏎️" },
];

export function OnboardingModal({ onDone }: { onDone: (sports: Sport[]) => void }) {
  const t = useSportTheme();
  const [picked, setPicked] = useState<Sport[]>([]);
  const toggle = (s: Sport) =>
    setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.scrim}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.eyebrow, { color: t.mutedText }]}>WELCOME TO MPP+</Text>
          <Text style={[styles.title, { color: t.text }]}>Pick your sports</Text>
          <Text style={[styles.sub, { color: t.mutedText }]}>We'll tailor your match day board.</Text>
          <View style={styles.options}>
            {SPORT_OPTIONS.map((o) => {
              const on = picked.includes(o.id);
              return (
                <Pressable
                  key={o.id}
                  onPress={() => toggle(o.id)}
                  style={[styles.opt, { borderColor: on ? t.primary : t.border, backgroundColor: on ? t.primary + "22" : "transparent" }]}
                >
                  <Text style={styles.emoji}>{o.emoji}</Text>
                  <Text style={[styles.optLabel, { color: t.text }]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => onDone(picked)} style={[styles.cta, { backgroundColor: t.primary }]}>
            <Text style={styles.ctaText}>{picked.length ? "Start predicting" : "Skip for now"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 420, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 22 },
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 2 },
  title: { fontFamily: FONTS.display, fontSize: 26, marginTop: 8 },
  sub: { fontFamily: FONTS.body, fontSize: 13, marginTop: 6 },
  options: { flexDirection: "row", gap: 12, marginTop: 20 },
  opt: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 18, alignItems: "center", gap: 8 },
  emoji: { fontSize: 28 },
  optLabel: { fontFamily: FONTS.bodyMed, fontSize: 14 },
  cta: { marginTop: 22, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  ctaText: { fontFamily: FONTS.displayBold, fontSize: 15, color: "#fff" },
});
