import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { SportThemeProvider } from "@/theme/useSportTheme";
import { Floodlight } from "@/components";
import { OnboardingModal } from "@/components";
import { useSession } from "@/store/useSession";
import { COLORS } from "@/theme/tokens";

export default function RootLayout() {
  const [loaded] = useFonts({
    Archivo_700Bold, Archivo_800ExtraBold,
    Inter_400Regular, Inter_600SemiBold,
    JetBrainsMono_500Medium, JetBrainsMono_700Bold,
  });
  const { onboarded, hydrated, completeOnboarding } = useSession();

  if (!loaded || !hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.ink }]}>
        <ActivityIndicator color={COLORS.violet} />
      </View>
    );
  }

  return (
    <SportThemeProvider sport="default">
      <Floodlight>
        <Slot />
        {!onboarded && <OnboardingModal onDone={completeOnboarding} />}
      </Floodlight>
      <StatusBar style="light" />
    </SportThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
