export const metrics = [
  { key: "content", title: "Load time", unit: "ms", limits: [500, 1000], bands: ["Under 500 ms", "500–1,000 ms", "1,000 ms and up"] },
  { key: "memory", title: "Memory", unit: "MiB", limits: [100, 400], bands: ["Under 100 MiB", "100–400 MiB", "400 MiB and up"] },
  { key: "size", title: "App size", unit: "MiB", limits: [25, 150], bands: ["Under 25 MiB", "25–150 MiB", "150 MiB and up"] },
  { key: "switch", title: "Switching", unit: "ms", limits: [250, 500], bands: ["Under 250 ms", "250–500 ms", "500 ms and up"] },
] as const;

export const bucketColors = ["#5eead4", "#a5b4fc", "#c4b5fd"];
export function metricBuckets(key: string) {
  return metrics.find(metric => metric.key === (key === "jump" ? "switch" : key))!;
}
export function bucketIndex(value: number, key: string) {
  return metricBuckets(key).limits.filter(limit => value >= limit).length;
}
export function bucketLayout(rows: { name: string; value: number }[], key: string) {
  const positions: Record<string, number> = {};
  const headers: { label: string; y: number; color: string }[] = [];
  let y = 0;
  metricBuckets(key).bands.forEach((label, index) => {
    const members = rows.filter(row => bucketIndex(row.value, key) === index);
    if (!members.length) return;
    headers.push({ label, y, color: bucketColors[index] });
    y += 45;
    for (const row of members) { positions[row.name] = y; y += 43; }
    y += 24;
  });
  return { positions, headers };
}
