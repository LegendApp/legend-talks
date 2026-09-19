import { SceneMotionView } from "@legend-apps/presentation";
import { View, type StyleProp, type ViewStyle } from "react-native";

/** Shared chart material; grouped colors crossfade on the UI thread. */
export function ChartBar({ highlighted = false, groupColor, grouped = false, style }: {
  highlighted?: boolean;
  groupColor?: string;
  grouped?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const color = highlighted ? "#67e8f9" : "#b8c2ce";
  return <SceneMotionView duration={450} initialPose={{ scaleX: 0 }} pose={{ scaleX: 1, opacity: 0.65 }}
    style={[style, { minWidth: 2, borderRadius: 5, overflow: "hidden", transformOrigin: "left center" }]}>
    {groupColor ? <>
      <SceneMotionView pose={{ opacity: grouped ? 0 : 1 }} style={{ position: "absolute", inset: 0, backgroundColor: color }} />
      <SceneMotionView pose={{ opacity: grouped ? 1 : 0 }} style={{ position: "absolute", inset: 0, backgroundColor: groupColor }} />
    </> : <View style={{ position: "absolute", inset: 0, backgroundColor: color }} />}
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" }} />
  </SceneMotionView>;
}
