import React, { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { SportThemeProvider, useSportTheme } from "@/theme/useSportTheme";
import { SPORT_THEMES, type SportId } from "@/theme/sportThemes";
import { FONTS } from "@/theme/fonts";
import {
  SportHeader,
  LeagueCard,
  EventCard,
  PredictionCard,
  PredictionButton,
  LeaderboardRow,
  ResultCard,
  RewardCard,
  SeasonProgressBar,
} from "@/components";

const SPORTS: { id: SportId; label: string }[] = [
  { id: "f1", label: "F1" },
  { id: "nba", label: "NBA" },
  { id: "euroleague", label: "EuroLeague" },
  { id: "lnb", label: "LNB" },
];

export default function App() {
  const [sport, setSport] = useState<SportId>("f1");
  const [loaded] = useFonts({
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  if (!loaded) {
    return (
      <View style={[styles.loading, { backgroundColor: SPORT_THEMES.f1.background }]}>
        <ActivityIndicator color={SPORT_THEMES.f1.primary} />
      </View>
    );
  }

  return (
    <SportThemeProvider sport={sport}>
      <Screen sport={sport} onSwitch={setSport} />
      <StatusBar style="light" />
    </SportThemeProvider>
  );
}

function Screen({ sport, onSwitch }: { sport: SportId; onSwitch: (s: SportId) => void }) {
  const t = useSportTheme();
  const [pick, setPick] = useState<string>("");

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* full-screen floodlight wash in the active sport's colour */}
      <LinearGradient
        colors={[t.primary + "2E", t.background, t.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 56 }} />
        <SportHeader title="Match Day" subtitle="Call it before the lights go out." />

        {/* sport switcher — re-themes the whole screen */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.switcher}
        >
          {SPORTS.map((s) => {
            const on = s.id === sport;
            const st = SPORT_THEMES[s.id];
            return (
              <Pressable
                key={s.id}
                onPress={() => onSwitch(s.id)}
                style={[
                  styles.chip,
                  { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary + "22" : "transparent" },
                ]}
              >
                <Text style={{ color: on ? t.text : t.mutedText, fontFamily: FONTS.bodyMed, fontSize: 13 }}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.section}>
          <LeagueCard org={t.name} season={2026} sportId={sport} active />
        </View>

        <View style={styles.section}>
          <SeasonProgressBar value={0.42} label={`${t.name} 2026 season`} />
        </View>

        <View style={styles.section}>
          <EventCard
            title={sport === "f1" ? "Miami Grand Prix" : "Lakers vs Celtics"}
            scopeLabel={sport === "f1" ? "Race weekend" : "Match"}
            countdown="2h 10m"
            status="scheduled"
          >
            <PredictionCard
              label={sport === "f1" ? "Race winner" : "Match winner"}
              difficulty={2}
              lockedLabel={pick ? `Locked: ${pick}` : undefined}
            >
              {(sport === "f1" ? ["Verstappen", "Norris", "Leclerc"] : ["Lakers", "Celtics"]).map((o) => (
                <PredictionButton key={o} label={o} state={pick === o ? "selected" : "idle"} onPress={() => setPick(o)} />
              ))}
            </PredictionCard>
          </EventCard>
        </View>

        <View style={styles.section}>
          <ResultCard
            marketLabel={sport === "f1" ? "Fastest lap" : "Top scorer"}
            result={sport === "f1" ? "Piastri" : "L. James"}
            correct
            points={20}
          />
        </View>

        <SectionTitle text="Season ranking" />
        <View style={styles.section}>
          <View style={[styles.board, { backgroundColor: t.surface, borderColor: t.border }]}>
            <LeaderboardRow rank={1} name="Maya" points={134} tier="Diamond" accuracy={0.82} />
            <LeaderboardRow rank={2} name="You" points={119} tier="Platinum" accuracy={0.68} me />
            <LeaderboardRow rank={3} name="Diego" points={97} tier="Gold" accuracy={0.55} />
          </View>
        </View>

        <SectionTitle text="Rewards" />
        <View style={[styles.section, styles.rewards]}>
          <RewardCard icon="🎯" name="Sharp Shooter" desc="80%+ accuracy" />
          <RewardCard icon="🏆" name="Season Boss" desc="Win a mini-league" />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  const t = useSportTheme();
  return <Text style={[styles.sectionTitle, { color: t.mutedText }]}>{text.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  switcher: { gap: 8, paddingHorizontal: 20, paddingVertical: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  section: { paddingHorizontal: 20, paddingTop: 12 },
  sectionTitle: { fontFamily: FONTS.monoBold, fontSize: 11, letterSpacing: 2, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 2 },
  board: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  rewards: { flexDirection: "row", gap: 12 },
});
