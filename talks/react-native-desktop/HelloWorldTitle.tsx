import { SceneMotionView } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { AnimatedTitle } from "./AnimatedTitle";
import { MovingTitle } from "./MovingTitle";

const titleTextStyle = { color: "#f8fafc", fontSize: 72, lineHeight: 90, fontWeight: "600", letterSpacing: -1.8 } as const;

export function HelloWorldTitle({ metric }: { metric?: "first content" | "installed size" | "memory" }) {
  return <View accessible accessibilityRole="header" accessibilityLabel={metric ? `Hello World · ${metric}` : "Hello World"}
    style={{ width: 1696, height: 90, marginBottom: 36, alignSelf: "center", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
    {metric ? <MovingTitle>
      <Text style={titleTextStyle}>Hello World ·</Text>
    </MovingTitle> : <AnimatedTitle effect="stretch-release" fontSize={72}
      textStyle={{ fontWeight: "600", lineHeight: 90, letterSpacing: -1.8 }}>Hello World</AnimatedTitle>}
    {metric && <View style={{ width: 540, height: 90, marginLeft: 16, overflow: "hidden" }}>
      <SceneMotionView initialPose={{ y: 90, opacity: 0 }} pose={{ y: 0, opacity: 1 }} duration={650}>
        <Text style={titleTextStyle}>{metric}</Text>
      </SceneMotionView>
    </View>}
  </View>;
}
