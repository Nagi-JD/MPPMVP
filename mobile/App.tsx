import React, { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SportThemeProvider, useSportTheme } from "@/theme/useSportTheme";
import { SPORT_THEMES, type SportId } from "@/theme/sportThemes";
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
  return (
    <SportThemeProvider sport={sport}>
      <Screen sport={sport} onSwitch={setSport} />
      <StatusBar style="light" />
    </SportThemeProvider>
  );
}

function Screen({ sport, onSwitch }: { sport: SportId; onSwitch: (s: SportId) => void }) {
  const t = useSportTheme();
  // demo pick states for the prediction example
  const [pick, setPick] = useState<string>("");

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ height: 44 }} />
        <SportHeader title="Match Day" subtitle="Call it before the lights go out" />

        {/* sport switcher (demonstrates full re-theme per page) */}
        <View style={styles.switcher}>
          {SPORTS.map((s) => {
            const on = s.id === sport;
            const st = SPORT_THEMES[s.id];
            return (
              <Pressable
                key={s.id}
                onPress={() => onSwitch(s.id)}
                style={[
                  styles.chip,
                  { borderColor: on ? st.primary : t.border, backgroundColor: on ? st.primary : "transparent" },
                ]}
              >
                <Text style={{ color: on ? "#fff" : t.mutedText, fontWeight: "700", fontSize: 13 }}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

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
            <PredictionCard label={sport === "f1" ? "Race winner" : "Match winner"} difficulty={2} lockedLabel={pick ? `Locked: ${pick}` : undefined}>
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
        <View style={[styles.board, { backgroundColor: t.surface, borderColor: t.border }]}>
          <LeaderboardRow rank={1} name="Maya" points={134} tier="Diamond" accuracy={0.82} />
          <LeaderboardRow rank={2} name="You" points={119} tier="Platinum" accuracy={0.68} me />
          <LeaderboardRow rank={3} name="Diego" points={97} tier="Gold" accuracy={0.55} />
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
  switcher: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 2, paddingHorizontal: 16, paddingTop: 22, paddingBottom: 4 },
  board: { marginHorizontal: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  rewards: { flexDirection: "row", gap: 12 },
});
