import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

/** Shows a settled market's result and, if the user predicted, the outcome. */
export function ResultCard({
  marketLabel,
  result,
  correct,
  points,
  sportId,
}: {
  marketLabel: string;
  result: string;
  correct?: boolean;
  points?: number;
  sportId?: string;
}) {
  const t = useSportTheme(sportId);
  const outcomeColor = correct == null ? t.mutedText : correct ? t.success : t.danger;
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: t.mutedText }]}>{marketLabel.toUpperCase()}</Text>
        <Text style={[styles.result, { color: t.text }]}>{result}</Text>
      </View>
      {correct != null ? (
        <Text style={[styles.outcome, { color: outcomeColor }]}>
          {correct ? `+${points ?? 0} PTS` : "MISSED"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  label: { fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1 },
  result: { fontFamily: FONTS.display, fontSize: 16, marginTop: 3 },
  outcome: { fontFamily: FONTS.monoBold, fontSize: 12, letterSpacing: 0.5 },
});
