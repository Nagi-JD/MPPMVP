import React from "react";
import { Tabs } from "expo-router";
import { Target, Trophy, LayoutGrid, Award, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { useCategory } from "@/theme/ThemeProvider";
import { hapticSelection } from "@/components";

const TABS: { name: string; title: string; Icon: LucideIcon }[] = [
  { name: "index", title: "Prédire", Icon: Target },
  { name: "leaderboard", title: "Classement", Icon: Trophy },
  { name: "leagues", title: "Leagues", Icon: LayoutGrid },
  { name: "rewards", title: "Rewards", Icon: Award },
  { name: "profile", title: "Profil", Icon: User },
];

export default function TabsLayout() {
  const { theme } = useCategory();
  const accent = theme.accent;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: FONTS.bodyMed, fontSize: 11 },
        sceneStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    >
      {TABS.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused }) => (
              <Icon color={focused ? accent : COLORS.textMuted} size={22} />
            ),
          }}
          listeners={{ tabPress: () => hapticSelection() }}
        />
      ))}
    </Tabs>
  );
}
