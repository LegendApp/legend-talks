import { SceneMotionView, ScenePositionView, usePresentationValue, SharedElement, useSharedElementTransition } from "@legend-apps/presentation";
import { useLayoutEffect, useState } from "react";
import { Text, View } from "react-native";
import { ChartBar } from "./ChartBar";
import { bucketColors, bucketIndex, bucketLayout } from "./MetricBucketDefinitions";
import benchmarks from "./rnconnection-assets/benchmarks.json";

export const chartLayout = { width: 1696, height: 710, top: 55, rowSpacing: 57, rowHeight: 43, fontSize: 34, lineHeight: 42, barLeft: 285, barWidth: 1210, barHeight: 30, valueWidth: 190, marginTop: 24 };
export type Metric = "content" | "memory" | "size" | "jump" | "switch";
const units: Record<Metric, string> = { content: "ms", memory: "MiB", size: "MiB", jump: "ms", switch: "ms" };

/** Separate sibling markers keep text rigid while only the bar changes width. */
export function BenchmarkRow({ name, value, maximum, metric, y, groupColor, grouped = false, duration = 650 }: {
  name: string; value: number; maximum: number; metric: Metric; y: number;
  groupColor?: string; grouped?: boolean; duration?: number;
}) {
  const id = `benchmark-${name}`;
  const matched = useSharedElementTransition(`${id}-bar`);
  const [enteredThroughMatch, setEnteredThroughMatch] = useState(false);
  useLayoutEffect(() => { if (matched) setEnteredThroughMatch(true); }, [matched]);
  const highlighted = name === "React Native";
  const width = Math.max(2, value / maximum * chartLayout.barWidth);
  return <ScenePositionView y={y} duration={duration} style={{ left: 0, width: chartLayout.width, height: chartLayout.rowHeight }}>
    <SharedElement id={`${id}-label`} resize="preserve" style={{ position: "absolute", left: 0, top: 0, width: 280, height: chartLayout.rowHeight }}>
      <Text style={{ color: "#f1f5f9", fontWeight: highlighted ? "600" : "400", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight }}>{name}</Text>
    </SharedElement>
    <SharedElement id={`${id}-bar`} style={{ position: "absolute", left: chartLayout.barLeft, top: (chartLayout.rowHeight - chartLayout.barHeight) / 2, width, height: chartLayout.barHeight }}>
      <ChartBar highlighted={highlighted} groupColor={groupColor} grouped={grouped} animateEntrance={!matched && !enteredThroughMatch} style={{ width, height: chartLayout.barHeight }} />
    </SharedElement>
    <SharedElement id={`${id}-value`} resize="preserve" style={{ position: "absolute", right: 0, top: 0, width: chartLayout.valueWidth, height: chartLayout.rowHeight }}>
      <Text style={{ color: "#f1f5f9", textAlign: "right", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight, fontVariant: ["tabular-nums"] }}>{value.toFixed(0)} {units[metric]}</Text>
    </SharedElement>
  </ScenePositionView>;
}

export function BucketHeaders({ rows, metric, visible, workload = "chat" }: { rows: { name: string; value: number }[]; metric: Metric; visible: boolean; workload?: "chat" | "hello" }) {
  return <>{bucketLayout(rows, metric, workload).headers.map(header => <SceneMotionView key={header.label} hidden={!visible} pose={{ opacity: visible ? 1 : 0 }} duration={650}
    style={{ position: "absolute", left: 0, top: header.y, width: chartLayout.width }}>
    <Text style={{ color: header.color, fontSize: 25, lineHeight: 32 }}>{header.label}</Text>
  </SceneMotionView>)}</>;
}

export function Chart({ metric, workload = "chat" }: { metric: Metric; workload?: "chat" | "hello" }) {
  const grouped = usePresentationValue("stepIndex") >= 1;
  const rows = (workload === "chat" ? benchmarks.chat : benchmarks.hello)
    .map(row => ({ name: row.name, value: (row as unknown as Record<string, number>)[metric] }))
    .filter(row => Number.isFinite(row.value)).sort((a, b) => a.value - b.value);
  const maximum = Math.max(1, ...rows.map(row => row.value));
  const buckets = bucketLayout(rows, metric, workload);
  return <View style={{ width: chartLayout.width, height: chartLayout.height, marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    <BucketHeaders rows={rows} metric={metric} visible={grouped} workload={workload} />
    {rows.map(({ name, value }, index) => <BenchmarkRow key={name} name={name} value={value} metric={metric} maximum={maximum}
      grouped={grouped} groupColor={bucketColors[bucketIndex(value, metric, workload)]}
      y={grouped ? buckets.positions[name] : chartLayout.top + index * chartLayout.rowSpacing} />)}
  </View>;
}
