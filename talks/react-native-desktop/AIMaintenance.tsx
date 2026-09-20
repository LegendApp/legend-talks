import { Canvas, Circle, Path } from "@shopify/react-native-skia";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

const implementations = ["React Native", "AppKit", "SwiftUI", "Electron", "Tauri", "Deno", "Flutter", "Compose", "GPUI"];
const branchX = (index: number) => 96 + index * 188;

function Branches({ color }: { color: string }) {
  return <Canvas style={{ width: 1696, height: 390 }}>
    {implementations.map((name, index) => <Path key={name}
      path={`M 848 72 C 848 180, ${branchX(index)} 160, ${branchX(index)} 308`}
      color={color} style="stroke" strokeWidth={2} />)}
    {implementations.map((name, index) => <Circle key={name} cx={branchX(index)} cy={308} r={6} color={color} />)}
  </Canvas>;
}

export function AIMaintenance() {
  const maintenance = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 650, alignSelf: "center", marginTop: 20 }}>
    <View style={{ position: "absolute", top: 0, left: 0 }}><Branches color="#7dd9f0" /></View>
    <SceneMotionView pointerEvents="none" pose={{ opacity: maintenance ? 1 : 0 }} duration={700} style={{ position: "absolute", top: 0, left: 0 }}>
      <Branches color="#fda4af" />
    </SceneMotionView>
    {["One feature", "One bug fix"].map((label, index) => <SceneMotionView key={label}
      hidden={(index === 1) !== maintenance} pose={{ opacity: (index === 1) === maintenance ? 1 : 0 }} duration={350}
      style={{ position: "absolute", top: 6, left: 618, width: 460, alignItems: "center" }}>
      <Text style={{ color: index ? "#fda4af" : "#8de4ff", fontSize: 44, lineHeight: 56, fontWeight: "600" }}>{label}</Text>
    </SceneMotionView>)}
    {implementations.map((name, index) => <View key={name} style={{ position: "absolute", left: branchX(index) - 91, top: 338, width: 182, alignItems: "center" }}>
      <Text style={{ color: "#f1f5f9", fontSize: 25, lineHeight: 34, textAlign: "center", fontWeight: name === "React Native" ? "700" : "500" }}>{name}</Text>
      <SceneMotionView hidden={!maintenance} initialPose={{ opacity: 0, y: -18 }} pose={{ opacity: maintenance ? 1 : 0, y: maintenance ? 0 : -18 }} duration={450 + index * 55} style={{ marginTop: 18 }}>
        <Text style={{ color: "#fda4af", fontSize: 26, lineHeight: 34 }}>Fix + verify</Text>
      </SceneMotionView>
    </View>)}
    <SceneMotionView hidden={!maintenance} pose={{ opacity: maintenance ? 1 : 0, y: maintenance ? 0 : 20 }} duration={650} style={{ position: "absolute", top: 510, left: 0, right: 0 }}>
      <Text style={{ color: "#ffffff", fontSize: 62, lineHeight: 76, fontWeight: "600", textAlign: "center" }}>You still have to maintain it nine times</Text>
    </SceneMotionView>
  </View>;
}
