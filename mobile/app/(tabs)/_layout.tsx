import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

const TABS: { name: string; title: string; icon: string }[] = [
  { name: "index", title: "Predict", icon: "◎" },
  { name: "leaderboard", title: "Ranking", icon: "▦" },
  { name: "leagues", title: "Leagues", icon: "⬡" },
  { name: "rewards", title: "Rewards", icon: "✦" },
  { name: "profile", title: "You", icon: "◆" },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: COLORS.ink800, borderTopColor: COLORS.line, borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: FONTS.bodyMed, fontSize: 11 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <Text style={{ color: focused ? COLORS.lime : COLORS.muted, fontSize: 16 }}>{tab.icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
