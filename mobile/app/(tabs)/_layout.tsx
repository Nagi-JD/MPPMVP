import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { useSportTheme } from "@/theme/useSportTheme";
import { FONTS } from "@/theme/fonts";

const TABS: { name: string; title: string }[] = [
  { name: "index", title: "Match Day" },
  { name: "leagues", title: "Leagues" },
  { name: "leaderboard", title: "Ranks" },
  { name: "rewards", title: "Rewards" },
  { name: "profile", title: "Profile" },
];

export default function TabsLayout() {
  const t = useSportTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.mutedText,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.border, borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: FONTS.bodyMed, fontSize: 11 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>●</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}
