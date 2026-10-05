import { BenchmarkRow, BucketHeaders, chartLayout } from "../BenchmarkChart";
import { Emphasis } from "./Motion";
import { Text, View } from "react-native";
import { SceneMotionView, ScenePositionView, usePresentationValue } from "@legend-apps/presentation";
import { bucketColors, bucketIndex, bucketLayout } from "../MetricBucketDefinitions";
import benchmarks from "../rnconnection-assets/benchmarks.json";

const groups = [
  { title: "Native platform", names: ["AppKit", "SwiftUI"], color: "#a5b4fc" },
  { title: "Runtime / engine included", names: ["GPUI", "React Native", "Tauri", "Flutter", "Deno WebView", "Compose"], color: "#5eead4" },
  { title: "Bundled browser", names: ["Electron", "Deno CEF"], color: "#c4b5fd" },
];
const rows = [...benchmarks.hello].sort((a, b) => a.size - b.size);
const groupedRowSpacing = 47;
const groupSpacing = 90;
const groupStarts = groups.map((_, index) => 55 + groups.slice(0, index).reduce(
  (offset, group) => offset + rows.filter((row) => group.names.includes(row.name)).length * groupedRowSpacing + groupSpacing, 0,
));
const bucketRows = rows.map(row => ({ name: row.name, value: row.size }));
const buckets = bucketLayout(bucketRows, "size");
const focusOrder = [0, 2, 1];
const { width: chartWidth, height: chartHeight } = chartLayout;
const fullMaximum = 320;

/** Focus changes only vertical composition; every bar keeps its original length. */
export function HelloSizeJourney() {
  const step = usePresentationValue("stepIndex");
  const scene = Math.max(0, Math.min(5, step));
  const inBuckets = scene === 5;
  const focus = scene >= 2 && !inBuckets ? focusOrder[scene - 2] : -1;
  const grouped = scene !== 0;

  return <View style={{ width: chartWidth, height: chartHeight, marginTop: chartLayout.marginTop, alignSelf: "center", overflow: "hidden" }}>
    {scene >= 2 && scene < 5 && <View style={{ position: "absolute", left: 0, top: 100, width: chartWidth, height: 500 }}>
      <Emphasis width={chartWidth} height={500} mode={1} />
    </View>}
    <BucketHeaders rows={bucketRows} metric="size" visible={inBuckets} />
    {groups.map((group, groupIndex) => {
      const members = rows.filter((row) => group.names.includes(row.name));
      const focused = focus === groupIndex;
      const hidden = inBuckets || (focus >= 0 && !focused);
      // Focused sections form one continuous vertical strip. Clipping, rather than
      // opacity, hides neighboring groups so the camera passes through them.
      const focusedStart = (chartHeight - (members.length * 68 + 48)) / 2 + 48;
      const groupY = focus < 0 ? groupStarts[groupIndex]
        : focusedStart + (groupIndex - focus) * chartHeight;
      return <View key={group.title}>
        <ScenePositionView y={groupY - 50} duration={scene === 3 ? 1350 : 850} style={{ left: 0, width: chartWidth }}>
          <SceneMotionView hidden={!grouped || hidden} pose={{ opacity: grouped && !hidden ? 1 : 0 }}>
            <Text style={{ fontSize: 36, lineHeight: 44, color: group.color, fontWeight: "500" }}>{group.title}</Text>
          </SceneMotionView>
        </ScenePositionView>
        {members.map(({ name, size }, index) => {
          const y = inBuckets ? buckets.positions[name] : grouped ? groupY + index * (focus >= 0 ? 68 : groupedRowSpacing)
            : chartLayout.top + rows.findIndex(row => row.name === name) * chartLayout.rowSpacing;
          return <BenchmarkRow key={name} name={name} value={size} maximum={fullMaximum} metric="size" decimals={1} y={y}
            groupColor={inBuckets ? bucketColors[bucketIndex(size, "size")] : group.color} grouped={grouped} duration={scene === 3 ? 1350 : 850} />;
        })}
      </View>;
    })}
  </View>;
}
