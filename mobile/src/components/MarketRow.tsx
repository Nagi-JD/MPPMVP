import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS, RADIUS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { SPORTS } from "@/lib/catalog";
import type { Market, Prediction, Sport } from "@/lib/types";

function displayValue(market: Market, value: string): string {
  if (market.input === "score") return value.replace("-", " : ");
  if (market.input === "podium") return value.split(",").join(" › ");
  return value;
}

export function MarketRow({
  market,
  sport,
  accent,
  existing,
  onSubmit,
}: {
  market: Market;
  sport: Sport;
  accent: string;
  existing?: Prediction;
  onSubmit: (value: string) => Promise<void>;
}) {
  const meta = SPORTS[sport];
  const settled = market.status === "settled";
  const locked = settled || new Date(market.lockTime).getTime() <= Date.now();

  const init = existing?.value ?? "";
  const [choice, setChoice] = useState(market.input === "choice" ? init : "");
  const [home, setHome] = useState(market.input === "score" ? init.split("-")[0] ?? "" : "");
  const [away, setAway] = useState(market.input === "score" ? init.split("-")[1] ?? "" : "");
  const [podium, setPodium] = useState<string[]>(market.input === "podium" ? init.split(",") : ["", "", ""]);
  const [saving, setSaving] = useState(false);
  const flash = useRef(new Animated.Value(0)).current;

  function currentValue(): string | null {
    if (market.input === "choice") return choice || null;
    if (market.input === "score") return home !== "" && away !== "" ? `${home}-${away}` : null;
    const [a, b, c] = podium;
    return a && b && c ? `${a},${b},${c}` : null;
  }

  async function confirm() {
    const value = currentValue();
    if (!value || locked || saving) return;
    setSaving(true);
    try {
      await onSubmit(value);
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } finally {
      setSaving(false);
    }
  }

  const won = settled && existing && existing.correct;
  const options = market.options ?? [];
  const value = currentValue();

  return (
    <View style={styles.row}>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]}>
        <View style={styles.flashPill}>
          <Text style={[styles.flashText, { color: accent }]}>{meta.emoji} {meta.confirm}!</Text>
        </View>
      </Animated.View>

      <View style={styles.head}>
        <Text style={styles.label}>{market.label}</Text>
        <Text style={styles.diff}>
          {"◆".repeat(market.difficulty)}
          <Text style={{ color: COLORS.line }}>{"◆".repeat(3 - market.difficulty)}</Text>
        </Text>
      </View>

      {settled ? (
        <Text style={styles.settled}>
          <Text style={{ color: COLORS.muted }}>Result </Text>
          <Text style={styles.settledVal}>{market.result ? displayValue(market, market.result) : "—"}</Text>
          {existing ? (
            <Text style={{ color: won ? COLORS.lime : COLORS.magenta, fontFamily: FONTS.bodyMed }}>
              {"  "}{won ? `+${existing.pointsAwarded} pts` : "Missed"}
            </Text>
          ) : null}
        </Text>
      ) : (
        <>
          {market.input === "choice" && (
            <View style={styles.chips}>
              {options.map((o) => {
                const on = choice === o;
                return (
                  <Pressable key={o} disabled={locked} onPress={() => setChoice(o)}
                    style={[styles.chip, { borderColor: on ? accent : COLORS.line, backgroundColor: on ? accent + "33" : "transparent" }]}>
                    <Text style={{ color: on ? COLORS.white : COLORS.muted, fontFamily: FONTS.bodyMed, fontSize: 12 }}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {market.input === "score" && (
            <View style={styles.score}>
              <TextInput value={home} onChangeText={(v) => setHome(v.replace(/\D/g, "").slice(0, 3))}
                editable={!locked} keyboardType="number-pad" placeholder="0" placeholderTextColor={COLORS.muted}
                style={styles.scoreInput} />
              <Text style={{ color: COLORS.muted, fontFamily: FONTS.mono }}>:</Text>
              <TextInput value={away} onChangeText={(v) => setAway(v.replace(/\D/g, "").slice(0, 3))}
                editable={!locked} keyboardType="number-pad" placeholder="0" placeholderTextColor={COLORS.muted}
                style={styles.scoreInput} />
            </View>
          )}

          {market.input === "podium" && (
            <View style={styles.podium}>
              {["P1", "P2", "P3"].map((pos, i) => (
                <View key={pos} style={styles.podiumCol}>
                  <Text style={styles.podiumLabel}>{pos}</Text>
                  <View style={styles.pickerWrap}>
                    <Picker enabled={!locked} selectedValue={podium[i] ?? ""}
                      onValueChange={(v) => setPodium((p) => p.map((x, j) => (j === i ? String(v) : x)))}
                      dropdownIconColor={COLORS.muted} style={styles.picker}>
                      <Picker.Item label="—" value="" color={COLORS.muted} />
                      {options.map((o) => <Picker.Item key={o} label={o} value={o} color={COLORS.white} />)}
                    </Picker>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            {existing ? (
              <Text style={styles.lockedTxt}>Locked: <Text style={{ fontFamily: FONTS.mono }}>{displayValue(market, existing.value)}</Text></Text>
            ) : (
              <Text style={[styles.lockedTxt, { color: COLORS.muted }]}>Not predicted</Text>
            )}
            <Pressable disabled={locked || !value || saving} onPress={confirm}
              style={[styles.cta, { backgroundColor: accent, opacity: locked || !value || saving ? 0.4 : 1 }]}>
              <Text style={styles.ctaText}>{existing ? "Update" : "Confirm"}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: "relative", overflow: "hidden", borderRadius: RADIUS.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink, padding: 12 },
  flash: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, alignItems: "center", justifyContent: "center" },
  flashPill: { backgroundColor: "rgba(30,24,56,0.92)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  flashText: { fontFamily: FONTS.displayBold, fontSize: 14 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontFamily: FONTS.bodyMed, fontSize: 14, color: COLORS.white },
  diff: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted },
  settled: { fontFamily: FONTS.body, fontSize: 13 },
  settledVal: { fontFamily: FONTS.monoBold, color: COLORS.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  score: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreInput: { width: 56, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink700, borderRadius: 10, paddingVertical: 8, textAlign: "center", fontFamily: FONTS.mono, fontSize: 15, color: COLORS.white },
  podium: { flexDirection: "row", gap: 8 },
  podiumCol: { flex: 1 },
  podiumLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  pickerWrap: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.line, backgroundColor: COLORS.ink700, borderRadius: 10, overflow: "hidden" },
  picker: { color: COLORS.white },
  footer: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lockedTxt: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.violetLight },
  cta: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  ctaText: { fontFamily: FONTS.displayBold, fontSize: 12, color: "#fff" },
});
