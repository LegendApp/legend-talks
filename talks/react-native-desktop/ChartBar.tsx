import { SceneMotionView } from "@legend-apps/presentation";
import { View, type StyleProp, type ViewStyle } from "react-native";

/** Shared chart material; grouped colors crossfade on the UI thread. */
export function ChartBar({ highlighted = false, groupColor, grouped = false, animateEntrance = true, rounded = false, style }: {
  animateEntrance?: boolean;
  rounded?: boolean;
  highlighted?: boolean;
  groupColor?: string;
  grouped?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const color = highlighted ? "#67e8f9" : "#b8c2ce";
  return <SceneMotionView key={animateEntrance ? "entrance" : "matched"} duration={450} initialPose={animateEntrance ? { scaleX: 0 } : undefined} pose={{ scaleX: 1 }}
    style={[style, { minWidth: 2, borderRadius: rounded ? 999 : 5, overflow: "hidden", transformOrigin: "left center" }]}>
    {groupColor ? <>
      <SceneMotionView pose={{ opacity: grouped ? 0 : 0.65 }} style={{ position: "absolute", inset: 0, backgroundColor: color }} />
      <SceneMotionView pose={{ opacity: grouped ? 0.65 : 0 }} style={{ position: "absolute", inset: 0, backgroundColor: groupColor }} />
    </> : <View style={{ position: "absolute", inset: 0, backgroundColor: color, opacity: 0.65 }} />}
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: rounded ? 999 : 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.60)" }} />
  </SceneMotionView>;
}
