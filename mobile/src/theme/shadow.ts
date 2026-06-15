import { Platform, type ViewStyle } from "react-native";

/** A coloured glow shadow (sport primary), tuned per platform. */
export function glow(color: string, intensity = 0.45): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOpacity: intensity,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8, shadowColor: color },
    default: {},
  }) as ViewStyle;
}
