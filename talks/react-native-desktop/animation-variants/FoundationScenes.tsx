import { PlaybackKeyframeView, SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { FrameTitle } from "./FramePitch";
import { Arrive, Emphasis } from "./Motion";
import screenshot from "../rnconnection-assets/spark-runner-cli.png";
import releaseTracker from "../rnconnection-assets/macos-release-tracker.png";
import chatPoster from "../rnconnection-assets/app-recordings/chat-history.png";

const cyan = "#67e8f9", ink = "#f8fafc";

export function PlatformVersionsB() {
  const rows = [{ name: "iOS + Android", version: "0.87.1", y: 20 },
    { name: "Windows", version: "0.84.0", y: 230 }, { name: "macOS", version: "0.81.9", y: 440 }];
  return <View style={{ width: 1696, height: 670 }}>
    <View style={{ position: "absolute", left: 260, top: 0, width: 1176, height: 620, borderLeftWidth: 3, borderColor: cyan }}>
      {rows.map((row, i) => <Arrive key={row.name} delay={i * 230} fromX={-70} fromY={0}
        style={{ position: "absolute", left: i * 370, top: row.y, width: 400, height: 155, borderRadius: 24, borderWidth: 2, borderColor: i ? "#fbbf77" : cyan, backgroundColor: "#102637", padding: 24 }}>
        <Text style={{ color: ink, fontSize: 34 }}>{row.name}</Text>
        <Text style={{ color: i ? "#fbbf77" : cyan, fontSize: 72, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{row.version}</Text>
      </Arrive>)}
    </View>
  </View>;
}

export function ReleaseTrackerB() {
  const step = usePresentationValue("stepIndex");
  const height = 1500 * 254 / 706;
  const highlightTop = height * (step === 1 ? 0.30 : 0.68);
  const highlightHeight = height * (step === 1 ? 0.35 : 0.25);
  return <View style={{ width: 1696, height: 650, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
    <SceneMotionView pose={{ scaleX: step > 0 ? 1.1 : 1, scaleY: step > 0 ? 1.1 : 1, y: step === 1 ? 80 : step === 2 ? -95 : 0 }} duration={950}>
      <Image source={{ uri: releaseTracker }} resizeMode="contain" style={{ width: 1500, height, borderRadius: 24 }} accessibilityLabel="Original macOS release tracker; proposed release work, not completed releases" />
      {step > 0 && <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
        <View style={{ height: highlightTop, backgroundColor: "#000000b0" }} />
        <View style={{ height: highlightHeight }}><Emphasis width={1500} height={highlightHeight} /></View>
        <View style={{ flex: 1, backgroundColor: "#000000b0" }} />
      </View>}
    </SceneMotionView>
  </View>;
}

const imports = [
  ["useNativeMenu", "menus"], ["createTray", "tray"], ["registerGlobalShortcut", "global-shortcuts"],
  ["openWindow", "windows"], ["DragDropView", "drag-drop"], ["showNotification", "notifications"],
];

function NativeExample({ index }: { index: number }) {
  if (index === 0) return <View style={{ padding: 24, width: 500, borderRadius: 18, backgroundColor: "#263c51", gap: 16 }}>
    {["File", "Open…", "Save", "Quit"].map(label => <Text key={label} style={{ fontSize: 40, color: ink }}>{label}</Text>)}
  </View>;
  if (index === 1) return <View style={{ width: 550, height: 80, borderRadius: 16, backgroundColor: "#243b52", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", padding: 20, gap: 30 }}>
    <Text style={{ color: cyan, fontSize: 44 }}>✦</Text><Text style={{ color: ink, fontSize: 34 }}>12:34</Text>
  </View>;
  if (index === 2) return <View style={{ flexDirection: "row", gap: 20 }}>
    {["⌘", "⇧", "K"].map(key => <View key={key} style={{ width: 110, height: 110, borderRadius: 20, borderWidth: 2, borderColor: cyan, backgroundColor: "#153448", justifyContent: "center", alignItems: "center" }}><Text style={{ color: ink, fontSize: 60 }}>{key}</Text></View>)}
  </View>;
  if (index === 3) return <View style={{ width: 560, height: 350, borderRadius: 24, backgroundColor: "#102333", borderWidth: 2, borderColor: cyan, overflow: "hidden" }}>
    <View style={{ height: 48, backgroundColor: "#2b455a", paddingLeft: 18 }}><Text style={{ color: "#ff8a9b", fontSize: 30 }}>● ● ●</Text></View>
    <Text style={{ color: ink, fontSize: 42, textAlign: "center", marginTop: 90 }}>A native window</Text>
  </View>;
  if (index === 4) return <View style={{ width: 560, height: 250, borderWidth: 3, borderStyle: "dashed", borderColor: cyan, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
    <PlaybackKeyframeView previewTime={2} keyframes={[{ time: 0, x: -200, y: -80, opacity: 1 }, { time: 800, x: 0, y: 0, opacity: 1 }]}>
      <View style={{ width: 120, height: 140, borderRadius: 16, backgroundColor: "#2d7993", justifyContent: "center" }}><Text style={{ color: ink, fontSize: 38, textAlign: "center" }}>File</Text></View>
    </PlaybackKeyframeView>
  </View>;
  return <View style={{ width: 650, padding: 30, borderRadius: 24, backgroundColor: "#263c51", borderWidth: 1, borderColor: cyan }}>
    <Text style={{ color: ink, fontSize: 40, fontWeight: "600" }}>Legend Spark</Text><Text style={{ color: ink, fontSize: 34, marginTop: 18 }}>Your notification arrived</Text>
  </View>;
}

export function FramePitchB({ icon }: { icon: string }) {
  const step = Math.min(usePresentationValue("stepIndex"), imports.length - 1);
  return <View style={{ width: 1696, height: 880 }}>
    <FrameTitle icon={icon} />
    <View style={{ position: "absolute", top: 240, left: 0, width: 1696, height: 550 }}>
      {imports.map(([name, path], i) => <SceneMotionView key={path} pose={{ opacity: i === step ? 1 : 0.22, x: i === step ? 14 : 0 }} duration={400}
        style={{ position: "absolute", top: i * 85, left: 0, width: 930 }}>
        <Text style={{ color: ink, fontFamily: "Menlo", fontSize: 28 }}>{"import { "}<Text style={{ color: cyan }}>{name}</Text>{` } from "@legendapp/spark/${path}"`}</Text>
      </SceneMotionView>)}
      <Arrive key={step} clock="step" fromX={-90} fromY={0} style={{ position: "absolute", left: 1040, top: 75, width: 650, height: 400 }}><NativeExample index={step} /></Arrive>
    </View>
  </View>;
}

export function FrameRunnerB() {
  const step = usePresentationValue("stepIndex");
  const focused = step > 0;
  return <View style={{ width: 1696, height: 760, overflow: "hidden" }}>
    <SceneMotionView pose={{ scaleX: focused ? 1.4 : 1, scaleY: focused ? 1.4 : 1, x: focused ? -420 : 0, y: focused ? -100 : 0 }} duration={950}
      style={{ position: "absolute", left: 500, width: 678, height: 760 }}>
      <Image source={{ uri: screenshot }} resizeMode="contain" style={{ width: 678, height: 760 }} accessibilityLabel="Original Spark Runner CLI" />
    </SceneMotionView>
    {focused && <>
      <PlaybackKeyframeView previewTime={3} keyframes={[
        { time: 0, x: 0, y: 0, opacity: 0 }, { time: 900, x: 0, y: 0, opacity: 1 },
        { time: 1100, x: 0, y: 7, opacity: 1 }, { time: 1250, x: 0, y: 0, opacity: 1 },
      ]} style={{ position: "absolute", left: 745, top: 310, width: 110, height: 110, borderRadius: 18, backgroundColor: "#1f5b72", borderWidth: 2, borderColor: cyan, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: ink, fontSize: 72 }}>d</Text>
      </PlaybackKeyframeView>
      <SceneMotionView initialPose={{ scaleX: 0.04, scaleY: 0.04, x: -330, opacity: 0 }} pose={{ scaleX: 1, scaleY: 1, x: 0, opacity: 1 }} delay={1300} duration={850}
        style={{ position: "absolute", left: 900, top: 210, width: 760, height: 450, borderRadius: 18, borderWidth: 2, borderColor: cyan, overflow: "hidden" }}>
        <Image source={{ uri: chatPoster }} resizeMode="contain" style={{ width: 760, height: 450 }} />
      </SceneMotionView>
    </>}
  </View>;
}
