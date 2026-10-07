import { displayMetric } from "./benchmarkUnits";
import { SceneMotionView, ScenePositionView, usePresentationValue, SharedElement, useSharedElementEntrance } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import type { ReactNode } from "react";
import { ChartBar } from "./ChartBar";
import { bucketColors, bucketIndex, bucketLayout } from "./MetricBucketDefinitions";
import benchmarks from "./rnconnection-assets/benchmarks.json";

export const chartLayout = { width: 1696, height: 710, top: 55, rowSpacing: 57, rowHeight: 43, fontSize: 34, lineHeight: 42, barLeft: 285, barWidth: 1210, barHeight: 30, valueWidth: 190, marginTop: 24 };
export type Metric = "content" | "memory" | "size" | "jump" | "switch";
const units: Record<Metric, string> = { content: "ms", memory: "MB", size: "MB", jump: "ms", switch: "ms" };

/** Separate sibling markers keep text rigid while only the bar changes width. */
export function BenchmarkRow({ name, value, maximum, metric, y, groupColor, grouped = false, tintText = false, duration = 650, decimals = 0, valueLabel, valueContent, animateValue = false, highlighted = name === "React Native" }: {
  name: string; value: number; maximum: number; metric?: Metric; y: number;
  groupColor?: string; grouped?: boolean; tintText?: boolean; duration?: number; decimals?: number; valueLabel?: string; valueContent?: ReactNode; animateValue?: boolean; highlighted?: boolean;
}) {
  const id = `benchmark-${name}`;
  const animateEntrance = useSharedElementEntrance(`${id}-bar`);
  const width = Math.max(2, value / maximum * chartLayout.barWidth);
  return <ScenePositionView y={y} duration={duration} style={{ left: 0, width: chartLayout.width, height: chartLayout.rowHeight }}>
    <SharedElement id={`${id}-label`} resize="preserve" style={{ position: "absolute", left: 0, top: 0, width: 280, height: chartLayout.rowHeight }}>
      <Text style={{ color: "#f1f5f9", fontWeight: highlighted ? "600" : "400", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight }}>{name}</Text>
      {tintText && <SceneMotionView pose={{ opacity: grouped ? 1 : 0 }} duration={duration} style={{ position: "absolute", inset: 0 }}>
        <Text style={{ color: groupColor, fontWeight: highlighted ? "600" : "400", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight }}>{name}</Text>
      </SceneMotionView>}
    </SharedElement>
    <SharedElement id={`${id}-bar`} style={{ position: "absolute", left: chartLayout.barLeft, top: (chartLayout.rowHeight - chartLayout.barHeight) / 2, width: animateValue ? chartLayout.barWidth : width, height: chartLayout.barHeight }}>
      {animateValue ? <SceneMotionView pose={{ scaleX: width / chartLayout.barWidth }} duration={duration}
        style={{ width: chartLayout.barWidth, height: chartLayout.barHeight, transformOrigin: "left center" }}>
        <ChartBar highlighted={highlighted} groupColor={groupColor} grouped={grouped} animateEntrance={animateEntrance} style={{ width: chartLayout.barWidth, height: chartLayout.barHeight }} />
      </SceneMotionView> : <ChartBar highlighted={highlighted} groupColor={groupColor} grouped={grouped} animateEntrance={animateEntrance} style={{ width, height: chartLayout.barHeight }} />}
    </SharedElement>
    <SharedElement id={`${id}-value`} resize="preserve" style={{ position: "absolute", right: 0, top: 0, width: chartLayout.valueWidth, height: chartLayout.rowHeight }}>
      {valueContent ?? <Text style={{ color: "#f1f5f9", textAlign: "right", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight, fontVariant: ["tabular-nums"] }}>{valueLabel ?? (metric ? `${displayMetric(value, metric).toFixed(decimals)} ${units[metric]}` : value.toFixed(decimals))}</Text>}
      {tintText && <SceneMotionView pose={{ opacity: grouped ? 1 : 0 }} duration={duration} style={{ position: "absolute", inset: 0 }}>
        <Text style={{ color: groupColor, textAlign: "right", fontSize: chartLayout.fontSize, lineHeight: chartLayout.lineHeight, fontVariant: ["tabular-nums"] }}>{valueLabel ?? (metric ? `${displayMetric(value, metric).toFixed(decimals)} ${units[metric]}` : value.toFixed(decimals))}</Text>
      </SceneMotionView>}
    </SharedElement>
  </ScenePositionView>;
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
