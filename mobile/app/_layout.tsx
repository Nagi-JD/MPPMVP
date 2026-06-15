import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { SportThemeProvider, useSportTheme } from "@/theme/useSportTheme";
import { SPORT_THEMES } from "@/theme/sportThemes";
import { OnboardingModal } from "@/components";
import { useSession } from "@/store/useSession";

function sportToThemeId(fav: string | undefined): string {
  if (fav === "f1") return "f1";
  if (fav === "basketball") return "nba";
  return "default";
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Archivo_700Bold, Archivo_800ExtraBold,
    Inter_400Regular, Inter_600SemiBold,
    JetBrainsMono_500Medium, JetBrainsMono_700Bold,
  });
  const { favorites, onboarded, hydrated, completeOnboarding } = useSession();

  if (!loaded || !hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: SPORT_THEMES.default.background }]}>
        <ActivityIndicator color={SPORT_THEMES.default.primary} />
      </View>
    );
  }

  return (
    <SportThemeProvider sport={sportToThemeId(favorites[0])}>
      <Background>
        <Slot />
        {!onboarded && <OnboardingModal onDone={completeOnboarding} />}
      </Background>
      <StatusBar style="light" />
    </SportThemeProvider>
  );
}

function Background({ children }: { children: React.ReactNode }) {
  const t = useSportTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <LinearGradient
        colors={[t.primary + "2E", t.background, t.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
