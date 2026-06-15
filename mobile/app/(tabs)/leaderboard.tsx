import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SportHeader, LeaderboardRow } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { getSportTheme, resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { League, LeaderboardRow as Row } from "@/lib/types";

export default function LeaderboardScreen() {
  const t = useSportTheme();
  const { userId } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProvider().listLeagues().then((ls) => {
      setLeagues(ls);
      if (ls.length) setActive(ls[0].id);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    getProvider().leaderboard(active).then(setRows).finally(() => setLoading(false));
  }, [active]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Ranks" subtitle="Who's calling it best this season." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {leagues.map((l) => {
          const on = l.id === active;
          const st = getSportTheme(resolveSportId(l.id));
          return (
            <Pressable
              key={l.id}
              onPress={() => setActive(l.id)}
              style={[styles.chip, { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary + "22" : "transparent" }]}
            >
              <Text style={{ color: on ? t.text : t.mutedText, fontFamily: FONTS.bodyMed, fontSize: 13 }}>
                {l.org}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : rows.length === 0 ? (
        <Text style={[styles.empty, { color: t.mutedText }]}>No standings yet.</Text>
      ) : (
        <View style={[styles.board, { backgroundColor: t.surface, borderColor: t.border }]}>
          {rows.map((r, i) => (
            <LeaderboardRow
              key={r.user.id}
              rank={i + 1}
              name={r.user.id === userId ? "You" : r.user.displayName}
              points={r.points}
              tier={r.tier}
              accuracy={r.accuracy}
              me={r.user.id === userId}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  board: { marginHorizontal: 20, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
