import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { MovingTitle } from "./MovingTitle";
import type { ReactNode } from "react";
import { Image, Text, View } from "react-native";

const ink = "#f8fafc";
const accent = "#8be5ff";

function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  return <SceneMotionView hidden={!show} pose={{ opacity: show ? 1 : 0, y: show ? 0 : 22 }} duration={450}>{children}</SceneMotionView>;
}

/** All steps set native animation targets; no per-frame JavaScript. */
export function StoryMoment({ kind }: { kind: "discovery" | "question" | "frame" | "invite" | "objections" }) {
  const step = usePresentationValue("stepIndex");
  if (kind === "discovery") return <View style={{ height: 340, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: step > 0 ? -68 : 0 }} duration={550}>
      <Text style={{ color: ink, fontSize: 80, fontWeight: "600", textAlign: "center" }}>I came here to test LegendList</Text>
    </SceneMotionView>
    <View style={{ position: "absolute", top: 205, left: 0, right: 0 }}><Reveal show={step > 0}>
      <Text style={{ color: accent, fontSize: 80, fontWeight: "600", textAlign: "center" }}>I found an incredible platform</Text>
    </Reveal></View>
  </View>;
  const quotes = kind === "question" ? ["Was I just imagining it?", "So I measured it"]
    : kind === "objections" ? ["“I’d build native”", "“Electron has an ecosystem”", "“It’s hard to get started”"]
    : kind === "frame" ? ["Legend Frame", "Electron’s ambition.\nReact Native’s foundation."]
    : ["Please help", "Please help"];
  const current = Math.min(step, quotes.length - 1);
  return <View style={{ height: 420, justifyContent: "center" }}>
    {quotes.map((quote, index) => <SceneMotionView key={index} hidden={index !== current}
      pose={{ opacity: index === current ? 1 : 0, y: index === current ? 0 : index < current ? -35 : 35 }} duration={450}
      style={{ position: "absolute", left: 0, right: 0, top: 60, height: 240, justifyContent: "center" }}>
      <Text style={{ color: kind === "frame" && index > 0 ? accent : ink, fontSize: kind === "objections" ? 76 : 84, lineHeight: 104, fontWeight: "600", textAlign: "center" }}>{quote}</Text>
    </SceneMotionView>)}
    {kind === "invite" && <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Reveal show={step > 0}>
      <Text style={{ color: accent, fontSize: 46, textAlign: "center" }}>macOS       +       Windows</Text>
    </Reveal></View>}
  </View>;
}

export { RendererFamilies } from "./RendererWindows";

export { ExpoDesktopLayers } from "./ExpoDesktopScene";

export { CompatibilitySnapshot } from "./ModuleCompatibility";

export function SlidesHeader({ icon }: { icon: string }) {
  return <MovingTitle style={{ alignSelf: "center" }}>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <Image source={{ uri: icon }} style={{ width: 100, height: 100 }} resizeMode="contain" />
      <Text style={{ color: ink, fontSize: 72, fontWeight: "600" }}>Legend Slides</Text>
    </View>
  </MovingTitle>;
}

export function SlidesRelease({ icon }: { icon: string }) {
  return <View style={{ alignItems: "center", gap: 24 }}>
    <SlidesHeader icon={icon} />
    <Text style={{ color: accent, fontSize: 44, marginTop: 55 }}>Open source · 0.0.1</Text>
    <Text style={{ color: ink, fontSize: 34, marginTop: 30 }}>github.com/LegendApp/legend-apps</Text>
  </View>;
}

export function WordFlow({ labels }: { labels: string[] }) {
  return <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 36, marginTop: 65 }}>
    {labels.map((label, index) => <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 36 }}>
      {index > 0 && <Text style={{ color: accent, fontSize: 44 }}>→</Text>}
      <Text style={{ color: ink, fontSize: 38 }}>{label}</Text>
    </View>)}
  </View>;
}
