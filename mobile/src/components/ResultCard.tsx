import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSportTheme } from "@/theme/useSportTheme";

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
        <Text style={[styles.label, { color: t.mutedText }]}>{marketLabel}</Text>
        <Text style={[styles.result, { color: t.text }]}>{result}</Text>
      </View>
      {correct != null ? (
        <Text style={[styles.outcome, { color: outcomeColor }]}>
          {correct ? `+${points ?? 0} pts` : "Missed"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  label: { fontSize: 11, letterSpacing: 0.5 },
  result: { fontSize: 15, fontWeight: "800", marginTop: 2, fontVariant: ["tabular-nums"] },
  outcome: { fontSize: 13, fontWeight: "800" },
});
