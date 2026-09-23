import { Text, View } from "react-native";
import { BenchmarkRow, chartLayout } from "./BenchmarkChart";
import downloads from "./rnconnection-assets/npm-downloads.json";

const rows = downloads.rows.filter(row => row.package !== "react-native")
  .sort((a, b) => b.downloads - a.downloads);
const maximum = Math.max(...rows.map(row => row.downloads));
const compactCount = (value: number) => value >= 1_000_000
  ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;

export function NpmDownloadsChart() {
  return <View style={{ width: chartLayout.width, height: chartLayout.height,
    marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    {rows.map((row, index) => <BenchmarkRow key={row.package}
      name={row.package === "react-native-macos" ? "RN macOS" : row.name}
      value={row.downloads} maximum={maximum} valueLabel={compactCount(row.downloads)}
      grouped={row.package === "react-native-macos"} groupColor={row.package === "react-native-macos" ? "#67e8f9" : undefined}
      y={chartLayout.top + index * chartLayout.rowSpacing} />)}
    {downloads.notOnNpm.map((name, index) => <View key={name} style={{ position: "absolute",
      top: chartLayout.top + (rows.length + index + 0.5) * chartLayout.rowSpacing,
      width: chartLayout.width, height: chartLayout.rowHeight, flexDirection: "row", alignItems: "center" }}>
      <Text style={{ width: chartLayout.barLeft, color: "#f1f5f9", fontSize: chartLayout.fontSize,
        lineHeight: chartLayout.lineHeight }}>{name}</Text>
      <Text style={{ color: "#a5b3c4", fontSize: chartLayout.fontSize,
        lineHeight: chartLayout.lineHeight }}>Not on npm</Text>
    </View>)}
  </View>;
}
