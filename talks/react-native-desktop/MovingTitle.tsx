import { FocusSurfaceContext, SharedElement, usePresentationValue } from "@legend-apps/presentation";
import { useContext, type ReactNode } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

const titleId = "rnconnection-title";

/** Both title copies follow the same measured path; text trades places mid-flight. */
export function MovingTitle({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const motion = useContext(FocusSurfaceContext)?.motion;
  const active = usePresentationValue("isActive");
  const progress = motion?.elements.has(titleId) ? motion.progress : undefined;
  const opacity = progress?.interpolate({
    inputRange: [0, 0.35, 0.55, 0.8, 1],
    outputRange: active ? [0, 0, 0, 1, 1] : [1, 1, 0, 0, 0],
    extrapolate: "clamp",
  });
  const translateY = progress?.interpolate({
    inputRange: [0, 0.35, 0.55, 0.8, 1],
    outputRange: active ? [10, 10, 10, 0, 0] : [0, 0, -10, -10, -10],
    extrapolate: "clamp",
  });
  return <SharedElement id={titleId} style={style}>
    <Animated.View style={progress ? { opacity, transform: [{ translateY: translateY! }] } : undefined}>
      {children}
    </Animated.View>
  </SharedElement>;
}
