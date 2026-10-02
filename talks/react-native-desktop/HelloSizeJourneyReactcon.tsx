import { BenchmarkRow, chartLayout } from "./BenchmarkChart";
import { Text, View } from "react-native";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import benchmarks from "./rnconnection-assets/benchmarks.json";

const groups = [
  { title: "Already in macOS", names: ["AppKit", "SwiftUI"], color: "#a5b4fc" },
  { title: "Hermes + native views", names: ["React Native"], color: "#5eead4" },
  { title: "Bundled browser + runtime", names: ["Electron", "Deno CEF"], color: "#c4b5fd" },
];
const rows = [...benchmarks.hello].sort((a, b) => a.size - b.size);
const { width: chartWidth, height: chartHeight } = chartLayout;
const fullMaximum = 320;

/** Three explanations; all competitors retain the same positions and bar scale. */
export function HelloSizeJourney() {
  const step = usePresentationValue("stepIndex");
  const scene = Math.max(0, Math.min(groups.length - 1, step));
  const focus = groups[scene]!;

  return <View style={{ width: chartWidth, height: chartHeight, marginTop: chartLayout.marginTop, alignSelf: "center", overflow: "hidden" }}>
    {groups.map((group, index) => <SceneMotionView key={group.title} hidden={scene !== index}
      pose={{ opacity: scene === index ? 1 : 0 }} duration={450} style={{ position: "absolute", left: 0, top: 0 }}>
      <Text style={{ fontSize: 36, lineHeight: 44, color: group.color, fontWeight: "500" }}>{group.title}</Text>
    </SceneMotionView>)}
    {rows.map(({ name, size }, index) => <BenchmarkRow key={name} name={name} value={size}
      maximum={fullMaximum} metric="size" decimals={1} y={chartLayout.top + index * chartLayout.rowSpacing}
      groupColor={focus.color} grouped={focus.names.includes(name)} tintText highlighted={focus.names.includes(name)} />)}
  </View>;
}
