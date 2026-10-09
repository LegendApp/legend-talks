export const metrics = [
  { key: "content", title: "Load time", unit: "ms", limits: [500, 1000], bands: ["Under 500 ms", "500–1,000 ms", "1,000 ms and up"] },
  { key: "memory", title: "Memory", unit: "MB", limits: [100, 300], bands: ["Under 105 MB", "105–315 MB", "315 MB and up"] },
  { key: "size", title: "App size", unit: "MB", limits: [25, 150], bands: ["Under 26 MB", "26–157 MB", "157 MB and up"] },
  { key: "switch", title: "Switching", unit: "ms", limits: [250, 500], bands: ["Under 250 ms", "250–500 ms", "500 ms and up"] },
] as const;

export const bucketColors = ["#5eead4", "#a5b4fc", "#fda4af"];
export function metricBuckets(key: string, workload: "chat" | "hello" = "chat") {
  if (key === "jump") return {
    limits: [60, 75], bands: ["Under 60 ms", "60–75 ms", "Over 75 ms"],
  };
  if (key === "memory" && workload === "hello") return {
    limits: [25, 100], bands: ["Under 26 MB", "26–105 MB", "105 MB and up"],
  };
  return metrics.find(metric => metric.key === key)!;
}
export function bucketIndex(value: number, key: string, workload: "chat" | "hello" = "chat") {
  if (key === "jump") return value < 60 ? 0 : value <= 75 ? 1 : 2;
  return metricBuckets(key, workload).limits.filter(limit => value >= limit).length;
}
export function bucketLayout(rows: { name: string; value: number }[], key: string, workload: "chat" | "hello" = "chat") {
  const positions: Record<string, number> = {};
  const headers: { label: string; y: number; color: string }[] = [];
  let y = 0;
  metricBuckets(key, workload).bands.forEach((label, index) => {
    const members = rows.filter(row => bucketIndex(row.value, key, workload) === index);
    if (!members.length) return;
    headers.push({ label, y, color: bucketColors[index] });
    y += 45;
    for (const row of members) { positions[row.name] = y; y += 43; }
    y += 24;
  });
  return { positions, headers };
}
