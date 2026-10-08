import { ProgressivePreparation, usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { BenchmarkRow, chartLayout } from "./BenchmarkChart";
import { ElectronFire } from "./ElectronFire";
import downloads from "./rnconnection-assets/package-downloads.json";

const rows = [...downloads.rows]
  .sort((a, b) => b.downloads - a.downloads);
const maximum = Math.max(...rows.map(row => row.downloads));
const electronIndex = rows.findIndex(row => row.package === "electron");
const electronWidth = rows[electronIndex].downloads / maximum * chartLayout.barWidth;
const compactCount = (value: number) => value >= 1_000_000
  ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;

export function PackageDownloadsChart() {
  const emphasizeElectron = usePresentationValue("stepIndex") >= 1;
  return <View style={{ width: chartLayout.width, height: chartLayout.height,
    marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    {emphasizeElectron && <ElectronFire width={electronWidth} barHeight={chartLayout.barHeight} x={chartLayout.barLeft}
      y={chartLayout.top + electronIndex * chartLayout.rowSpacing + (chartLayout.rowHeight - chartLayout.barHeight) / 2} />}
    <ProgressivePreparation>{rows.map((row, index) => <BenchmarkRow key={row.package}
      name={row.name} highlighted={false}
      grouped={emphasizeElectron && row.package === "electron"} groupColor={row.package === "electron" ? "#a07142" : undefined} tintText={row.package === "electron"}
      value={row.downloads} maximum={maximum} valueLabel={compactCount(row.downloads)}
      y={chartLayout.top + index * chartLayout.rowSpacing} />)}</ProgressivePreparation>
  </View>;
}
