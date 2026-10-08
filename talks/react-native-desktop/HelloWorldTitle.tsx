import { SceneMotionView } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

const titleTextStyle = { color: "#f8fafc", fontSize: 72, lineHeight: 90, fontWeight: "600", letterSpacing: -1.8 } as const;

export function HelloWorldTitle({ metric }: { metric?: "first content" | "installed size" | "memory" }) {
  return <View accessible accessibilityRole="header" accessibilityLabel={metric ? `Hello World · ${metric}` : "Hello World"}
    style={{ width: 1696, height: 90, marginBottom: 36, alignSelf: "center", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
    <MovingTitle>
      <Text style={titleTextStyle}>{metric ? "Hello World ·" : "Hello World"}</Text>
    </MovingTitle>
    {metric && <View style={{ width: 540, height: 90, marginLeft: 16, overflow: "hidden" }}>
      <SceneMotionView initialPose={{ y: 90, opacity: 0 }} pose={{ y: 0, opacity: 1 }} duration={650}>
        <Text style={titleTextStyle}>{metric}</Text>
      </SceneMotionView>
    </View>}
  </View>;
}
