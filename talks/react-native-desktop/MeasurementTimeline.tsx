import { Canvas, Circle, Group, LinearGradient, Path, RoundedRect, vec } from "@shopify/react-native-skia";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

const cyan = "#85e5ff";
const frames = [
  { label: "Click", x: 0, y: 46, width: 450, height: 340, center: 225 },
  { label: "Window", x: 480, y: 46, width: 450, height: 340, center: 705 },
  { label: "First content", x: 960, y: 12, width: 650, height: 408, center: 1285 },
];

function LaunchFrame({ stage, width, height }: { stage: number; width: number; height: number }) {
  return <Canvas style={{ width, height }}>
    <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={20}>
      <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={["#203951", "#091420", "#163047"]} />
    </RoundedRect>
    <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={20} color="#5e7b94" style="stroke" strokeWidth={2} />
    <Path path={`M 0 ${height * 0.55} C ${width * 0.4} ${height * 0.62}, ${width * 0.55} ${height * 0.96}, ${width} ${height * 0.86}`} color="#3f7bbc" style="stroke" strokeWidth={2} />
    <RoundedRect x={width / 2 - 91} y={height - 43} width={182} height={31} r={10} color="#46576980" />
    {[0, 1, 2, 3, 4].map(i => <RoundedRect key={i} x={width / 2 - 78 + i * 33} y={height - 37} width={23} height={20} r={5} color={i % 2 ? "#6688b0" : "#70b1ed"} />)}
    {stage === 0 ? <Group transform={[{ translateX: width / 2 }, { translateY: height / 2 }]}>
      <Circle cx={0} cy={0} r={25} color="#78dafd" style="stroke" strokeWidth={2} />
      <Path path="M 0 0 L 0 43 L 12 32 L 23 51 L 31 46 L 20 28 L 37 26 Z" color="#e9f7ff" />
      <Path path="M 4 9 L 4 33 L 13 25 L 27 25 Z" color="#122438" />
    </Group> : <Group>
      <RoundedRect x={48} y={40} width={width - 96} height={height - 102} r={15} color="#0b1825" />
      <RoundedRect x={48} y={40} width={width - 96} height={height - 102} r={15} color="#668095" style="stroke" strokeWidth={1} />
      {["#ff6c69", "#f7c15c", "#6fd180"].map((color, i) => <Circle key={color} cx={65 + i * 17} cy={57} r={5} color={color} />)}
      {stage === 2 && <Group>
        <RoundedRect x={59} y={78} width={138} height={height - 152} r={9} color="#1e3042" />
        {[0, 1, 2, 3, 4].map(i => <Group key={i}>
          <Circle cx={77} cy={99 + i * 39} r={9} color={i === 0 ? "#529ce0" : "#607b96"} />
          <RoundedRect x={95} y={95 + i * 39} width={82 - (i % 2) * 18} height={6} r={3} color="#6d8ba4" />
        </Group>)}
        {[0, 1, 2, 3].map(i => <Group key={i}>
          <RoundedRect x={218 + (i % 2) * 72} y={86 + i * 49} width={210} height={38} r={10} color={i % 2 ? "#265e9d" : "#2b4055"} />
          <RoundedRect x={234 + (i % 2) * 72} y={99 + i * 49} width={148} height={5} r={2.5} color="#8bb3dc" />
          <RoundedRect x={234 + (i % 2) * 72} y={110 + i * 49} width={94} height={4} r={2} color="#688cad" />
        </Group>)}
        <RoundedRect x={216} y={height - 95} width={width - 282} height={23} r={10} color="#23394d" />
      </Group>}
    </Group>}
  </Canvas>;
}

export function MeasurementTimeline() {
  const step = Math.min(usePresentationValue("stepIndex"), 2);
  return <View accessibilityLabel="Video frames: click, window opens, first visible content. Measure from click to first content." style={{ width: 1610, height: 680, alignSelf: "center", marginTop: 24 }}>
    {frames.map((frame, index) => <View key={frame.label} style={{ position: "absolute", left: frame.x, top: frame.y }}>
      <SceneMotionView pose={{ opacity: step >= index ? 1 : 0.35 }} duration={550}>
        <LaunchFrame stage={index} width={frame.width} height={frame.height} />
      </SceneMotionView>
      {index === 2 && <SceneMotionView pointerEvents="none" pose={{ opacity: step === 2 ? 1 : 0 }} duration={650}
        style={{ position: "absolute", inset: -8, borderRadius: 26, borderWidth: 3, borderColor: cyan, shadowColor: cyan, shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }} />}
    </View>)}
    <View style={{ position: "absolute", left: 0, right: 0, top: 485, height: 1, backgroundColor: "#355c73" }} />
    {frames.map(frame => <View key={frame.label} style={{ position: "absolute", left: frame.center - 150, top: 435, width: 300, alignItems: "center" }}>
      <View style={{ height: 50, width: 1, backgroundColor: "#507b94" }} />
      <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: -6, backgroundColor: cyan }} />
      <Text style={{ color: "#f1f5f9", fontSize: 28, marginTop: 20 }}>{frame.label}</Text>
    </View>)}
    <SceneMotionView pose={{ x: frames[step].center - frames[0].center }} duration={900}
      style={{ position: "absolute", left: frames[0].center - 12, top: 473, width: 24, height: 24, borderRadius: 12, backgroundColor: cyan, shadowColor: cyan, shadowOpacity: 0.9, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }} />
  </View>;
}
