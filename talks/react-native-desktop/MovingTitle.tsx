import { SharedElement } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** Move and crossfade titles without stretching text to match a different line count. */
export function MovingTitle({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <SharedElement id="rnconnection-title" resize="preserve" style={style}>
    {children}
  </SharedElement>;
}
