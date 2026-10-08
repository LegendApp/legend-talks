import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { NavigationExitView } from "@legend-apps/presentation";

/** Carousel placement uses slide playback; exit uses the host's navigation progress. */
export function FilmstripMotionView({ index, enabled, animateExit = true, progress, children, style }: {
  index: number; enabled: boolean; animateExit?: boolean; progress: SharedValue<{ position: number }>; children: ReactNode; style?: StyleProp<ViewStyle>;
}) {
  const motionStyle = useAnimatedStyle(() => {
    "worklet";
    // Keep native layout onstage: offscreen layout bounds can clip text and
    // GPU surfaces before the carousel transform brings them into view.
    if (!enabled) return { transform: [{ translateX: index * 900 }, { scale: 1 }], opacity: 1 };
    const distance = Math.abs(index - progress.value.position);
    const scale = 1 - 0.38 * Math.min(1, distance) - 0.1 * Math.min(1, Math.max(0, distance - 1));
    const initialScale = index === 0 ? 1 : index === 1 ? 0.62 : 0.52;
    const opacity = distance < 1 ? 1 - distance * 0.3 : Math.max(0.25, 0.7 - (distance - 1) * 0.2);
    return { zIndex: Math.round(1000 - distance * 100),
      transform: [{ translateX: (index - progress.value.position) * 900 }, { scale: scale / initialScale }], opacity };
  });
  return <Animated.View style={[style, motionStyle]}>
    <NavigationExitView enabled={enabled && animateExit} style={{ flex: 1 }}>
      {children}
    </NavigationExitView>
  </Animated.View>;
}
