import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import benchmarks from "./rnconnection-assets/benchmarks.json";

// September 19 reference table: RN remeasured September 19, Compose September 18,
// others September 17. App-only sizes exclude external grammar packs.
// Keep this mixed-date overview separate from the synchronized charts.
const rows = [
  ...benchmarks.chat.map(row => row.name === "React Native"
    ? { ...row, content: 393.2, memory: 54.1, switch: 183.0 } : row),
  { name: "Compose", content: 1277.3, memory: 786.1, size: 116.5, switch: 326.2 },
];
const metrics = [
  { key: "content", title: "Load time", unit: "ms", limits: [500, 1000], bands: ["Under 500 ms", "500–1,000 ms", "1,000 ms and up"] },
  { key: "memory", title: "Memory", unit: "MiB", limits: [100, 400], bands: ["Under 100 MiB", "100–400 MiB", "400 MiB and up"] },
  { key: "size", title: "App size", unit: "MiB", limits: [25, 150], bands: ["Under 25 MiB", "25–150 MiB", "150 MiB and up"] },
  { key: "switch", title: "Switching", unit: "ms", limits: [250, 500], bands: ["Under 250 ms", "250–500 ms", "500 ms and up"] },
] as const;

export function MetricBuckets() {
  const spotlight = usePresentationValue("stepIndex") >= 1;
  return <View style={{ width: 1696, height: 740, marginTop: 28 }}>
    <View style={{ flexDirection: "row", gap: 24 }}>
      {metrics.map(metric => {
        const sorted = [...rows].sort((a, b) => a[metric.key] - b[metric.key]);
        return <View key={metric.key} style={{ width: 406 }}>
          <Text style={{ color: "#ffffff", fontSize: 36, fontWeight: "600", textAlign: "center", marginBottom: 20 }}>{metric.title}</Text>
          {metric.bands.map((label, index) => {
            const entries = sorted.filter(row => {
              const value = row[metric.key];
              return value >= (index === 0 ? 0 : metric.limits[index - 1]!) && value < (metric.limits[index] ?? Infinity);
            });
            return <View key={label} style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
              borderRadius: 18, borderWidth: 1, borderColor: index === 0 ? "#6ca6b9" : "#344658",
              backgroundColor: index === 0 ? "#122f3d" : "#101e2d" }}>
              <Text style={{ fontSize: 23, lineHeight: 30, color: index === 0 ? "#a5edff" : "#dae3eb", marginBottom: 7 }}>{label}</Text>
              {entries.map(row => {
                const rn = row.name === "React Native";
                return <SceneMotionView key={row.name} duration={450} pose={{ opacity: spotlight && !rn ? 0.35 : 1 }}
                  style={{ height: 38, flexDirection: "row", alignItems: "center", paddingHorizontal: 6,
                    borderRadius: 7, backgroundColor: rn ? "#285165" : "transparent" }}>
                  <Text numberOfLines={1} style={{ flex: 1, fontSize: 24, color: rn ? "#a5edff" : "#f1f5f9", fontWeight: rn ? "700" : "400" }}>{row.name}</Text>
                  <Text style={{ fontSize: 24, color: rn ? "#a5edff" : "#f1f5f9", fontWeight: rn ? "700" : "400", fontVariant: ["tabular-nums"] }}>{row[metric.key].toFixed(1)}</Text>
                </SceneMotionView>;
              })}
            </View>;
          })}
        </View>;
      })}
    </View>
    <Text style={{ color: "#e2e8f0", fontSize: 20, lineHeight: 28, textAlign: "center", marginTop: 10 }}>
      Chat History · Lower is better · Practical bands, not statistical ties
    </Text>
    <Text style={{ color: "#cbd5e1", fontSize: 18, lineHeight: 26, textAlign: "center" }}>
      macOS M4 · Mixed September 17–19 runs/builds · Initial footprint · App-only sizes exclude external grammars
    </Text>
  </View>;
}
