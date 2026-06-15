import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SportHeader, LeagueCard } from "@/components";
import { useSportTheme } from "@/theme/useSportTheme";
import { resolveSportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import { getProvider } from "@/lib/data/client";
import type { League } from "@/lib/types";

export default function LeaguesScreen() {
  const t = useSportTheme();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProvider().listLeagues()
      .then(setLeagues)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <SportHeader title="Leagues" subtitle="Every competition you can call." />
      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={[styles.empty, { color: t.danger }]}>Couldn't load leagues.</Text>
      ) : (
        leagues.map((l) => (
          <View key={l.id} style={styles.section}>
            <LeagueCard org={l.org} season={l.season} sportId={resolveSportId(l.id)} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { textAlign: "center", marginTop: 40, fontFamily: FONTS.body, fontSize: 13 },
});
