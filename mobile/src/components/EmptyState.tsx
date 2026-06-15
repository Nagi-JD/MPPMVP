import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Inbox, type LucideIcon } from "lucide-react-native";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";

interface Props {
  /** A Lucide icon component (e.g. Inbox) or a custom node. */
  icon?: LucideIcon | React.ReactNode;
  title: string;
  message?: string;
}

function isIconComponent(icon: Props["icon"]): icon is LucideIcon {
  return typeof icon === "function";
}

/** Centered, muted empty placeholder. */
export function EmptyState({ icon, title, message }: Props) {
  const Icon: LucideIcon = isIconComponent(icon) ? icon : Inbox;

  return (
    <View style={styles.container}>
      {isIconComponent(icon) || icon == null ? (
        <Icon color={COLORS.textFaint} size={36} strokeWidth={1.5} />
      ) : (
        icon
      )}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 17,
    color: COLORS.text,
    textAlign: "center",
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
