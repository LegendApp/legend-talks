import { displayMetric } from "./benchmarkUnits";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import type { ReactNode } from "react";
import { BarRow, defaultBarRowLayout } from "slides:charts/BarRow";
import { bucketColors, bucketIndex, bucketLayout } from "./MetricBucketDefinitions";
import benchmarks from "./rnconnection-assets/benchmarks.json";

export const chartLayout = defaultBarRowLayout;
export type Metric = "content" | "memory" | "size" | "jump" | "switch";
const units: Record<Metric, string> = { content: "ms", memory: "MB", size: "MB", jump: "ms", switch: "ms" };

export function BenchmarkRow({ metric, decimals = 0, highlighted, valueLabel, ...props }: {
  name: string; value: number; maximum: number; metric?: Metric; y: number;
  groupColor?: string; grouped?: boolean; tintText?: boolean; duration?: number; decimals?: number; valueLabel?: string; valueContent?: ReactNode; animateValue?: boolean; highlighted?: boolean;
}) {
  return <BarRow {...props} id={`benchmark-${props.name}`} highlighted={highlighted ?? props.name === "React Native"}
    decimals={decimals} valueLabel={valueLabel ?? (metric ? `${displayMetric(props.value, metric).toFixed(decimals)} ${units[metric]}` : undefined)} />;
}

export function BucketHeaders({ rows, metric, visible, workload = "chat" }: { rows: { name: string; value: number }[]; metric: Metric; visible: boolean; workload?: "chat" | "hello" }) {
  return <>{bucketLayout(rows, metric, workload).headers.map(header => <SceneMotionView key={header.label} hidden={!visible} pose={{ opacity: visible ? 1 : 0 }} duration={650}
    style={{ position: "absolute", left: 0, top: header.y, width: chartLayout.width }}>
    <Text style={{ color: header.color, fontSize: 25, lineHeight: 32 }}>{header.label}</Text>
  </SceneMotionView>)}</>;
}

export function Chart({ metric, workload = "chat", groupAtStep = 1 }: { metric: Metric; workload?: "chat" | "hello"; groupAtStep?: number }) {
  const grouped = usePresentationValue("stepIndex") >= groupAtStep;
  const rows = (workload === "chat" ? benchmarks.chat : benchmarks.hello)
    .map(row => ({ name: row.name, value: (row as unknown as Record<string, number>)[metric] }))
    .filter(row => Number.isFinite(row.value)).sort((a, b) => a.value - b.value);
  const maximum = Math.max(1, ...rows.map(row => row.value));
  const buckets = bucketLayout(rows, metric, workload);
  return <View style={{ width: chartLayout.width, height: chartLayout.height, marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    <BucketHeaders rows={rows} metric={metric} visible={grouped} workload={workload} />
    {rows.map(({ name, value }, index) => <BenchmarkRow key={name} name={name} value={value} metric={metric} maximum={maximum}
      decimals={workload === "hello" && metric === "size" ? 1 : 0} grouped={grouped} groupColor={bucketColors[bucketIndex(value, metric, workload)]}
      y={grouped ? buckets.positions[name] : chartLayout.top + index * chartLayout.rowSpacing} />)}
  </View>;
}
