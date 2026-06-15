import React from "react";
import Svg, { Path, Circle, Line } from "react-native-svg";
import type { Sport } from "@/lib/types";

/** Original sport-evocative marks (ported from web SportLogo). */
export function SportLogo({ sport, size = 20 }: { sport: Sport; size?: number }) {
  if (sport === "f1") {
    // viewBox 0 0 48 24 → keep 2:1 aspect
    return (
      <Svg width={size} height={size / 2} viewBox="0 0 48 24">
        <Path d="M6 15 L30 15 L27 19 L3 19 Z" fill="#E10600" />
        <Path d="M10 9 L42 9 L39 13 L7 13 Z" fill="#E10600" />
        <Path d="M30 3 L46 3 L43 7 L27 7 Z" fill="#E10600" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="#F97316" />
      <Line x1={12} y1={2} x2={12} y2={22} stroke="#0B0916" strokeWidth={1.4} />
      <Line x1={2} y1={12} x2={22} y2={12} stroke="#0B0916" strokeWidth={1.4} />
      <Path d="M4.6 4.6 C9 9 9 15 4.6 19.4" fill="none" stroke="#0B0916" strokeWidth={1.4} />
      <Path d="M19.4 4.6 C15 9 15 15 19.4 19.4" fill="none" stroke="#0B0916" strokeWidth={1.4} />
    </Svg>
  );
}
