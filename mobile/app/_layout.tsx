import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { Floodlight, OnboardingModal } from "@/components";
import { useSession } from "@/store/useSession";
import { COLORS } from "@/theme/tokens";
import { ThemeProvider } from "@/theme/ThemeProvider";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Floodlight>
          <Slot />
          {!onboarded && <OnboardingModal onDone={completeOnboarding} />}
          <StatusBar style="light" />
        </Floodlight>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
