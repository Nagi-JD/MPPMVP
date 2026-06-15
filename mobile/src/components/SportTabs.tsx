import React, { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { COLORS } from "@/theme/tokens";
import { FONTS } from "@/theme/fonts";
import { hapticSelection } from "./haptics";

export interface SportTab {
  id: string;
  label: string;
  accent: string;
}

interface Props {
  tabs: SportTab[];
  activeId: string;
  onChange: (id: string) => void;
}

const SPRING = { damping: 18, stiffness: 180 };

/** Horizontal segmented control with a sliding accent underline. */
export function SportTabs({ tabs, activeId, onChange }: Props) {
  const layouts = useRef<Record<string, { x: number; width: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const activeAccent = tabs.find((t) => t.id === activeId)?.accent ?? COLORS.text;

  const moveIndicator = useCallback(
    (id: string) => {
      const l = layouts.current[id];
      if (l) {
        indicatorX.value = withSpring(l.x, SPRING);
        indicatorW.value = withSpring(l.width, SPRING);
      }
    },
    [indicatorX, indicatorW],
  );

  const onTabLayout = useCallback(
    (id: string, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      layouts.current[id] = { x, width };
      if (id === activeId) {
        indicatorX.value = x;
        indicatorW.value = width;
      }
    },
    [activeId, indicatorX, indicatorW],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    backgroundColor: activeAccent,
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          active={tab.id === activeId}
          onLayout={(e) => onTabLayout(tab.id, e)}
          onPress={() => {
            if (tab.id !== activeId) {
              hapticSelection();
              moveIndicator(tab.id);
              onChange(tab.id);
            }
          }}
        />
      ))}
      <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
    </ScrollView>
  );
}

function Tab({
  tab,
  active,
  onPress,
  onLayout,
}: {
  tab: SportTab;
  active: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onLayout={onLayout}
      onPressIn={() => {
        scale.value = withSpring(0.94, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={[styles.tab, animStyle]}>
        <Text
          style={[styles.label, { color: active ? tab.accent : COLORS.textMuted }]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    position: "relative",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontFamily: FONTS.bodyMed,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  indicator: {
    position: "absolute",
    left: 16,
    bottom: 2,
    height: 2.5,
    borderRadius: 2,
  },
});
