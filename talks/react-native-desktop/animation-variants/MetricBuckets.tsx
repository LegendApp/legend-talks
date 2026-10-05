import { displayMetric } from "../benchmarkUnits";
import { Arrive, Emphasis } from "./Motion";
import { Text, View } from "react-native";
import { metrics } from "../MetricBucketDefinitions";
import benchmarks from "../rnconnection-assets/benchmarks.json";

// All chat comparisons share the latest reference measurements.
const rows = benchmarks.chat;


export function MetricBuckets() {
  return <View style={{ width: 1696, height: 740, marginTop: 28 }}>
    <View style={{ flexDirection: "row", gap: 24 }}>
      {metrics.map((metric, metricIndex) => {
        const sorted = [...rows].sort((a, b) => a[metric.key] - b[metric.key]);
        return <View key={metric.key} style={{ width: 406 }}>
          <Text style={{ color: "#b8c2ce", fontSize: 34, lineHeight: 42, fontWeight: "500", textAlign: "center", marginBottom: 20 }}>{metric.title}</Text>
          {metric.bands.map((label, index) => {
            const entries = sorted.filter(row => {
              const value = row[metric.key];
              return value >= (index === 0 ? 0 : metric.limits[index - 1]!) && value < (metric.limits[index] ?? Infinity);
            });
            return <View key={label} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 23, lineHeight: 30, color: "#aebac8", marginBottom: 8, paddingHorizontal: 4 }}>{label}</Text>
              <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                borderWidth: 1, borderColor: index === 0 ? "#587889" : "#354656",
                backgroundColor: index === 0 ? "#122a38" : "#101e2d" }}>
                {entries.map(row => {
                  const rn = row.name === "React Native";
                  return <Arrive key={row.name} delay={metricIndex * 400 + sorted.indexOf(row) * 55} fromX={-60} fromY={-20}><View style={{ height: 38, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 }}>
                    {rn && <Arrive delay={2400} fromY={0} style={{ position: "absolute", inset: 0 }}><Emphasis width={382} height={38} /></Arrive>}
                    {rn && <View
                      style={{ position: "absolute", inset: 0, borderRadius: 8, borderWidth: 1,
                        borderColor: "#8bd7ec", backgroundColor: "#285165" }} />}
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 24, color: "#ffffff", fontWeight: rn ? "700" : "400" }}>{row.name}</Text>
                    <Text style={{ fontSize: 24, color: "#ffffff", fontWeight: rn ? "700" : "400", fontVariant: ["tabular-nums"] }}>{displayMetric(row[metric.key], metric.key).toFixed(0)}</Text>
                  </View></Arrive>;
                })}
              </View>
            </View>;
          })}
        </View>;
      })}
    </View>
  </View>;
}
