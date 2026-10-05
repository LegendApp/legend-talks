import { PlaybackKeyframeView, SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { Chart, chartLayout } from "../BenchmarkChart";
import { bucketIndex, bucketLayout } from "../MetricBucketDefinitions";
import { displayMetric } from "../benchmarkUnits";
import benchmarks from "../rnconnection-assets/benchmarks.json";
import downloads from "../rnconnection-assets/package-downloads.json";
import { PackageDownloadsChart } from "../PackageDownloadsChart";
import { GlassPanels } from "../GlassPanels";
import { Arrive, Emphasis } from "./Motion";

const cyan = "#67e8f9", ink = "#f8fafc";
type Metric = "content" | "memory" | "size" | "jump" | "switch";

export function PackageDownloadsB() {
  const combine = usePresentationValue("stepIndex") > 0;
  const electron = downloads.rows.find(row => row.package === "electron")!;
  const tauri = downloads.rows.find(row => row.name === "Tauri")!;
  const total = electron.downloads + tauri.downloads;
  return <View style={{ width: 1696, height: 740 }}>
    <SceneMotionView pose={{ opacity: combine ? 0.16 : 1 }} duration={500}><PackageDownloadsChart /></SceneMotionView>
    {combine && <View style={{ position: "absolute", top: 190, left: 0, width: 1696, height: 420 }}>
      {[electron, tauri].map((row, i) => <SceneMotionView key={row.name} initialPose={{ y: i * 180, x: 0 }}
        pose={{ y: 70, x: i === 0 ? 0 : electron.downloads / total * 1400 }} duration={1000} style={{ position: "absolute", width: 1400 }}>
        <Text style={{ color: ink, fontSize: 42, marginBottom: 24 }}>{row.name}</Text>
        <View style={{ width: row.downloads / total * 1400, height: 76, borderRadius: 16, backgroundColor: i ? "#bba6ff" : cyan }} />
      </SceneMotionView>)}
      <Arrive delay={1100} clock="step" style={{ position: "absolute", top: 265, width: 1696 }}>
        <Text style={{ color: cyan, fontSize: 58, textAlign: "center", fontWeight: "600" }}>Electron + Tauri · {(total / 1_000_000).toFixed(1)}M downloads</Text>
      </Arrive>
    </View>}
  </View>;
}

export function MetricChartB({ metric, workload = "chat" }: { metric: Metric; workload?: "hello" | "chat" }) {
  const step = usePresentationValue("stepIndex");
  const rows = (workload === "chat" ? benchmarks.chat : benchmarks.hello)
    .map(row => ({ name: row.name, value: Number((row as unknown as Record<string, unknown>)[metric]) }))
    .filter(row => Number.isFinite(row.value)).sort((a, b) => a.value - b.value);
  const layout = bucketLayout(rows, metric, workload);
  const leading = rows.filter(row => bucketIndex(row.value, metric, workload) === 0);
  const groupHeight = leading.length * 43;
  const rn = rows.find(row => row.name === "React Native")!;
  const electron = rows.find(row => row.name === "Electron")!;
  const maximum = Math.max(...rows.map(row => row.value));
  const showDemo = step >= 2 && (metric === "jump" || metric === "switch" || metric === "memory");
  return <View style={{ width: 1696, height: 740 }}>
    <SceneMotionView pose={{ opacity: showDemo ? 0.08 : 1 }} duration={650}><Chart metric={metric} workload={workload} /></SceneMotionView>
    {step >= 1 && !showDemo && leading.length > 0 && <View style={{ position: "absolute", left: 0, top: 24 + 40, width: 1696, height: groupHeight + 10 }}>
      <Emphasis width={1696} height={groupHeight + 10} />
    </View>}
    {metric === "size" && step >= 1 && <Arrive clock="step" delay={800} style={{ position: "absolute", right: 220, top: 470 }}>
      <View style={{ borderLeftWidth: 3, borderColor: cyan, paddingLeft: 28 }}>
        <Text style={{ color: cyan, fontSize: 62, fontWeight: "600" }}>{(electron.value / rn.value).toFixed(1)}×</Text>
        <Text style={{ color: ink, fontSize: 34 }}>Electron / React Native</Text>
      </View>
      <View style={{ position: "absolute", top: -70, right: 0, width: (electron.value - rn.value) / maximum * chartLayout.barWidth,
        height: 40, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: cyan }} />
    </Arrive>}
    {showDemo && metric === "memory" && <View style={{ position: "absolute", top: 100, left: 0, width: 1696 }}>
      <Text style={{ color: ink, fontSize: 54, textAlign: "center", marginBottom: 70 }}>A browser, plus its helper processes</Text>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 24 }}>
        {["App", "Renderer", "GPU", "Helpers"].map((label, i) => <Arrive key={label} delay={i * 180} clock="step" fromY={90}>
          <View style={{ width: 370, height: 240, borderWidth: 2, borderColor: i === 0 ? cyan : "#bba6ff", borderRadius: 22, backgroundColor: "#15283c", justifyContent: "center" }}>
            <Text style={{ color: ink, fontSize: 42, textAlign: "center" }}>{label}</Text>
          </View>
        </Arrive>)}
      </View>
      <Arrive delay={1000} clock="step"><Text style={{ color: cyan, fontSize: 56, textAlign: "center", marginTop: 70 }}>{displayMetric(electron.value, "memory").toFixed(0)} MB total · Electron</Text></Arrive>
    </View>}
    {showDemo && (metric === "jump" || metric === "switch") && <View style={{ position: "absolute", top: 90, left: 0, width: 1696 }}>
      <Text style={{ color: ink, fontSize: 50, textAlign: "center", marginBottom: 65 }}>{metric === "jump" ? "Jump to top" : "Switch conversation"}</Text>
      {[rn, electron].map((row, i) => <View key={row.name} style={{ flexDirection: "row", height: 230, gap: 40, alignItems: "center" }}>
        <Text style={{ width: 330, fontSize: 40, color: ink }}>{row.name}</Text>
        <View style={{ width: 1000, height: 170, backgroundColor: "#0b1725", borderRadius: 22, borderWidth: 2, borderColor: i === 0 ? cyan : "#bba6ff", overflow: "hidden" }}>
          <PlaybackKeyframeView repeatDuration={3000} previewTime={2} keyframes={[
            { time: 0, x: 0, y: metric === "jump" ? -100 : 0, opacity: 0 },
            { time: 500 + row.value - 1, x: 0, y: metric === "jump" ? -100 : 0, opacity: 0 },
            { time: 500 + row.value, x: 0, y: 0, opacity: 1 },
            { time: 2800, x: 0, y: 0, opacity: 1 },
          ]} style={{ padding: 35 }}><Text style={{ color: ink, fontSize: 42 }}>{metric === "jump" ? "Beginning of conversation" : "Selected conversation"}</Text>
            <View style={{ marginTop: 24, height: 7, width: 760, backgroundColor: cyan, borderRadius: 4 }} />
          </PlaybackKeyframeView>
        </View>
        <Text style={{ width: 230, fontSize: 48, color: cyan }}>{row.value.toFixed(0)} ms</Text>
      </View>)}
    </View>}
    {step >= 1 && metric === "content" && <View pointerEvents="none" accessibilityElementsHidden style={{ position: "absolute", left: 285,
      top: 24 + (layout.positions[rn.name] ?? 0) + 5, width: 1210, height: 43 }}><Emphasis width={1210} height={43} mode={1} /></View>}
  </View>;
}

export const musicContributions = {
  cpu: [{ name: "Spotify", value: 2.2 }, { name: "Helper", value: 0.2 }, { name: "GPU", value: 9.1 }, { name: "Renderer", value: 15.1 }],
  memory: [{ name: "Spotify", value: 212.3 }, { name: "Helper 1", value: 16 }, { name: "Helper 2", value: 19.7 },
    { name: "Helper 3", value: 30.6 }, { name: "GPU", value: 273.3 }, { name: "Renderer", value: 255.6 }],
};
const musicRows = { cpu: [["Legend Music", 2], ["Apple Music", 2], ["Spotify", 26]] as const,
  memory: [["Legend Music", 72], ["Apple Music", 149], ["Spotify", 806]] as const };

export function MusicPerformanceB({ metric, capture }: { metric: "size" | "cpu" | "memory"; capture: string }) {
  const step = usePresentationValue("stepIndex");
  if (metric === "size") return <View style={{ width: 1696, height: 730, alignItems: "center" }}>
    <View style={{ width: 1450, height: 400, marginTop: 30 }}>
      <Text style={{ color: ink, fontSize: 44, marginBottom: 30 }}>Installed app · 35 MB</Text>
      <SceneMotionView initialPose={{ scaleX: 1, y: 0 }} pose={{ scaleX: step > 0 ? 11 / 35 : 1, y: step > 0 ? 190 : 0 }} duration={1400}
        style={{ width: 1400, height: 110, transformOrigin: "left center", borderWidth: 2, borderColor: cyan, borderRadius: 24, backgroundColor: "#1b677d" }} />
      {step > 0 && <Arrive delay={1500} clock="step" style={{ position: "absolute", left: 480, top: 285 }}><Text style={{ color: cyan, fontSize: 64, fontWeight: "600" }}>Zipped download · 11 MB</Text></Arrive>}
    </View>
    <Image source={{ uri: capture }} style={{ width: 1122, height: 255, borderRadius: 24 }} resizeMode="contain" accessibilityLabel="Historical RNL 2025 Finder capture" />
  </View>;

  const contributions = musicContributions[metric];
  const total = contributions.reduce((sum, row) => sum + row.value, 0);
  const max = metric === "cpu" ? 26 : 806;
  return <View style={{ width: 1696, height: 730, flexDirection: "row", gap: 50, alignItems: "center" }}>
    <View style={{ width: 1020, height: 670 }}>
      <GlassPanels panels={[{ x: 0, y: 0, width: 1020, height: 650, radius: 28 }]} width={1020} height={670} />
      {musicRows[metric].map(([name, value], i) => <View key={name} style={{ position: "absolute", left: 40, top: 35 + i * 190, width: 940 }}>
        <Text style={{ color: ink, fontSize: 40, fontWeight: name === "Legend Music" ? "700" : "500" }}>{name}</Text>
        <Text style={{ position: "absolute", right: 0, top: 0, color: cyan, fontSize: 48, fontWeight: "600" }}>{value}{metric === "cpu" ? "%" : " MB"}</Text>
        {name !== "Spotify" && <Arrive delay={i * 180} fromX={-40} fromY={0}><View style={{ marginTop: 28, width: 940 * value / max,
          height: 64, borderRadius: 10, backgroundColor: name === "Legend Music" ? cyan : "#bba6ff" }} /></Arrive>}
        {name === "Spotify" && contributions.map((row, j) => {
          const x = contributions.slice(0, j).reduce((sum, part) => sum + part.value, 0) / total * 940;
          const width = row.value / total * 940;
          return <SceneMotionView key={row.name} initialPose={{ x: 1030 - x, y: -170 + j * 65, opacity: 0 }}
            pose={{ x: step > 0 ? 0 : 1030 - x, y: step > 0 ? 0 : -170 + j * 65, opacity: step > 0 ? 1 : 0 }} delay={j * 120} duration={950}
            style={{ position: "absolute", left: x, top: 82, width, height: 64, backgroundColor: ["#fd8997", "#dba5fc", "#a59eff", "#78aeef", "#a5c5ef", "#81cfdb"][j], borderWidth: 1, borderColor: "#ffffff88" }} />;
        })}
      </View>)}
      {step > 0 && <View style={{ position: "absolute", top: metric === "memory" ? 15 : 195, left: 20, width: 980, height: metric === "memory" ? 160 : 160 }}>
        <Arrive delay={1500} clock="step"><Emphasis width={980} height={160} /></Arrive>
      </View>}
    </View>
    <View style={{ width: 626, height: 626 }}>
      <Image source={{ uri: capture }} resizeMode="contain" style={{ width: 626, height: 626 }} accessibilityLabel={`Original RNL 2025 ${metric} capture; historical rounded totals shown at left`} />
      {step > 0 && <View style={{ position: "absolute", left: 0, top: metric === "cpu" ? 300 : 290, width: 626, height: metric === "cpu" ? 275 : 300 }}><Emphasis width={626} height={metric === "cpu" ? 275 : 300} /></View>}
    </View>
  </View>;
}
