import { Animated, View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

/** Lightweight tinted glass styling; does not capture or blur the backdrop. */
export function GlassMaterial({ tint, radius = 5, style, children }: {
  tint: ColorValue | Animated.AnimatedInterpolation<string>;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return <View style={[style, { borderRadius: radius, overflow: "hidden" }]}>
    <Animated.View pointerEvents="none" style={{ position: "absolute", inset: 0, backgroundColor: tint, opacity: 0.8 }} />
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: radius, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }} />
    <View pointerEvents="none" style={{ position: "absolute", top: 1, left: 1, right: 1, height: "38%", borderTopLeftRadius: radius, borderTopRightRadius: radius, backgroundColor: "rgba(255,255,255,0.13)" }} />
    <View pointerEvents="none" style={{ position: "absolute", bottom: 1, left: 1, right: 1, height: 1, backgroundColor: "rgba(255,255,255,0.18)" }} />
    {children}
  </View>;
}
