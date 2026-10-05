import { usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { BenchmarkRow, chartLayout } from "./BenchmarkChart";
import downloads from "./rnconnection-assets/package-downloads.json";

const rows = [...downloads.rows]
  .sort((a, b) => b.downloads - a.downloads);
const maximum = Math.max(...rows.map(row => row.downloads));
const compactCount = (value: number) => value >= 1_000_000
  ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;

export function PackageDownloadsChart() {
  const emphasizeElectron = usePresentationValue("stepIndex") >= 1;
  return <View style={{ width: chartLayout.width, height: chartLayout.height,
    marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    {rows.map((row, index) => <BenchmarkRow key={row.package}
      name={row.name} highlighted={false}
      grouped={emphasizeElectron && row.package === "electron"} groupColor="#f28b91" tintText={row.package === "electron"}
      value={row.downloads} maximum={maximum} valueLabel={compactCount(row.downloads)}
      y={chartLayout.top + index * chartLayout.rowSpacing} />)}
  </View>;
}
