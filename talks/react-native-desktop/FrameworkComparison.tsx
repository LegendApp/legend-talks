import { Text, View } from "react-native";
import { ChartBar } from "./ChartBar";
import { GlassPanels } from "./GlassPanels";
import { frameworkCoverage, platforms } from "./FrameworkCoverage";
import benchmarks from "./rnconnection-assets/benchmarks.json";

// Equal-weight geometric mean of best/value for first content, switching and
// initial memory. Deno uses the mean of its two backend scores, not cherry-picked metrics.
const scoreMetrics = ["content", "switch", "memory"] as const;
const best = scoreMetrics.map(metric => Math.min(...benchmarks.chat.map(row => row[metric])));
const score = (row: typeof benchmarks.chat[number]) =>
  Math.pow(scoreMetrics.reduce((product, metric, index) => product * best[index] / row[metric], 1), 1 / 3);
const rows = frameworkCoverage.map(framework => {
  const samples = benchmarks.chat.filter(row => framework.name === "Deno" ? row.name.startsWith("Deno") : row.name === framework.name);
  if (!samples.length) throw new Error(`Missing benchmark for ${framework.name}`);
  return { ...framework, score: samples.reduce((sum, row) => sum + score(row), 0) / samples.length };
});

const panels = [
  { x: 270, y: 28, width: 480, height: 784, radius: 24 },
  { x: 775, y: 28, width: 290, height: 784, radius: 24 },
  { x: 1095, y: 28, width: 580, height: 784, radius: 24 },
];

export function FrameworkComparison() {
  return <View accessibilityLabel="Framework comparison: performance index, native content controls, and platform coverage. Half-filled Web dots mean reusable web UI; Tauri mobile half dots reflect the presenter’s assessment of the experience." style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <GlassPanels panels={panels} width={1696} height={850} />
    {[{ name: "Performance", x: 270, width: 480 }, { name: "Native UI", x: 775, width: 290 }, { name: "Cross platform", x: 1095, width: 590 }].map(column =>
      <Text key={column.name} style={{ position: "absolute", left: column.x, top: 64, width: column.width, fontSize: 36, lineHeight: 44, fontWeight: "600", color: "#f1f5f9", textAlign: "center" }}>{column.name}</Text>)}
    {platforms.map((platform, index) => <Text key={platform} style={{ position: "absolute", left: 1118 + index * 110, top: 124, width: 105, textAlign: "center", color: "#b8c2ce", fontSize: 23 }}>{platform}</Text>)}
    {rows.map((row, index) => {
      const highlighted = row.name === "React Native";
      const y = 200 + index * 66;
      return <View key={row.name} accessibilityLabel={`${row.name}: performance index ${Math.round(row.score * 100)}, native UI ${row.native ? "yes" : "no"}, ${row.coverage.filter(value => value === 1).length} platforms${row.coverage.includes(0.5) ? ` plus ${row.coverage.filter(value => value === 0.5).length} qualified targets` : ""}`} style={{ position: "absolute", left: 0, top: y - 29, width: 1696, height: 58, justifyContent: "center" }}>
        {highlighted && <View style={{ position: "absolute", inset: 0, borderRadius: 14, borderWidth: 1, borderColor: "#65cde8b0", backgroundColor: "#20608055", shadowColor: "#35cfff", shadowOpacity: 0.42, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }} />}
        <Text style={{ width: 266, paddingLeft: 12, color: highlighted ? "#8de4ff" : "#f1f5f9", fontSize: 32, lineHeight: 40, fontWeight: highlighted ? "700" : "500" }}>{row.name}</Text>
        <View style={{ position: "absolute", left: 294, top: 15, width: 432, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#c8e7ff35", backgroundColor: "#90b6db20", shadowColor: highlighted ? "#50dbff" : "#90cbff", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }}>
          <ChartBar highlighted={highlighted} rounded style={{ width: 432 * row.score, height: 28 }} />
        </View>
        <View style={{ position: "absolute", left: 896, top: 5, width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: row.native ? 2 : 0, borderColor: highlighted ? "#85eeff" : "#e4f3ff", shadowColor: highlighted ? "#5be7ff" : "#94caff", shadowOpacity: row.native ? 0.65 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }}>
          <Text style={{ fontSize: 34, lineHeight: 42, color: row.native ? highlighted ? "#7ce8f7" : "#e7f5ff" : "#778ea6" }}>{row.native ? "✓" : "–"}</Text>
        </View>
        {row.coverage.map((value, column) => <View key={column} style={{ position: "absolute", left: 1156 + column * 110, top: 14, width: 30, height: 30, borderRadius: 15, shadowColor: highlighted ? "#55e3ff" : "#88c9ff", shadowOpacity: value ? 0.8 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, backgroundColor: value === 1 ? highlighted ? "#71e3fa" : "#b4dcf8" : "transparent" }}>
          <View style={{ flex: 1, borderRadius: 15, borderWidth: 1.5, borderColor: value ? "#d4efff" : "#506b82", overflow: "hidden" }}>
            {value === 0.5 && <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, backgroundColor: "#c2e5ff" }} />}
            {value > 0 && <View style={{ position: "absolute", left: 4, top: 3, width: value === 0.5 ? 8 : 17, height: 7, borderRadius: 5, backgroundColor: "#ffffff65" }} />}
          </View>
        </View>)}
      </View>;
    })}
  </View>;
}
