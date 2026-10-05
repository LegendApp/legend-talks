import { PlaybackKeyframeView } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export function Arrive({ children, delay = 0, fromX = 0, fromY = 24, clock = "slide", style }: {
  children: ReactNode; delay?: number; fromX?: number; fromY?: number;
  clock?: "slide" | "step"; style?: StyleProp<ViewStyle>;
}) {
  return <PlaybackKeyframeView clock={clock} delay={delay} previewTime={8} style={style} keyframes={[
    { time: 0, x: fromX, y: fromY, opacity: 0 },
    { time: 520, x: -fromX * 0.06, y: -fromY * 0.06, opacity: 1 },
    { time: 720, x: 0, y: 0, opacity: 1 },
  ]}>{children}</PlaybackKeyframeView>;
}
