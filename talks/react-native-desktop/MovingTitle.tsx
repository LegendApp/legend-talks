import { SharedElement } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** Let the slide crossfade own opacity so the moving titles never both disappear. */
export function MovingTitle({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <SharedElement id="rnconnection-title" style={style}>
    {children}
  </SharedElement>;
}
