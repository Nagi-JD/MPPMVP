/**
 * Thin wrapper around expo-haptics.
 * - NO-OPS on web (Platform.OS === "web").
 * - Safe if the native module is unavailable (try/catch).
 */
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

function safe(fn: () => void) {
  if (Platform.OS === "web") return;
  try {
    fn();
  } catch {
    // haptics unavailable — silently ignore
  }
}

/** Light selection tick (tab switch, segmented control). */
export function hapticSelection() {
  safe(() => Haptics.selectionAsync());
}

/** Light impact (button press). */
export function hapticLight() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Success notification feedback. */
export function hapticSuccess() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
