import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import { Image, Text, View } from "react-native";

const ink = "#f8fafc";
const accent = "#8be5ff";
const line = "rgba(139,229,255,0.65)";

function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  return <SceneMotionView hidden={!show} pose={{ opacity: show ? 1 : 0, y: show ? 0 : 22 }} duration={450}>{children}</SceneMotionView>;
}

/** All steps set native animation targets; no per-frame JavaScript. */
export function StoryMoment({ kind }: { kind: "discovery" | "question" | "frame" | "invite" | "objections" }) {
  const step = usePresentationValue("stepIndex");
  if (kind === "discovery") return <View style={{ height: 340, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: step > 0 ? -68 : 0 }} duration={550}>
      <Text style={{ color: ink, fontSize: 80, fontWeight: "600", textAlign: "center" }}>I came here to test a list</Text>
    </SceneMotionView>
    <View style={{ position: "absolute", top: 205, left: 0, right: 0 }}><Reveal show={step > 0}>
      <Text style={{ color: accent, fontSize: 80, fontWeight: "600", textAlign: "center" }}>I found an incredible platform</Text>
    </Reveal></View>
  </View>;
  const quotes = kind === "question" ? ["Was I just imagining it?", "So I measured it"]
    : kind === "objections" ? ["“I’d build native”", "“Electron has an ecosystem”", "“It’s hard to get started”"]
    : kind === "frame" ? ["Legend Frame", "Electron’s ambition.\nReact Native’s foundation."]
    : ["Does your library\nsupport desktop?", "Does your library\nsupport desktop?"];
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

export function RendererFamilies() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ flexDirection: "row", gap: 50, marginTop: 42 }}>
    {[{ name: "Platform views", labels: "AppKit · SwiftUI\nReact Native", inner: "OS controls" },
      { name: "Browser content", labels: "Electron · Tauri · Deno", inner: "HTML + CSS" },
      { name: "Framework-drawn", labels: "Flutter · Compose · GPUI", inner: "GPU drawing surface" }].map((family, index) => <View key={family.name} style={{ flex: 1, gap: 24, alignItems: "center" }}>
        <View style={{ width: "100%", height: 285, borderWidth: 2, borderColor: "#8093a5", borderRadius: 16, overflow: "hidden", backgroundColor: "#102031" }}>
          <View style={{ height: 36, paddingLeft: 16, justifyContent: "center", borderBottomWidth: 1, borderColor: "#8093a5" }}><Text style={{ color: ink }}>● ● ●</Text></View>
          <Reveal show={step >= index}>
            <View style={{ height: 245, padding: 26, justifyContent: "center", gap: 20 }}>
              {index === 0 ? <View style={{ flexDirection: "row", gap: 16 }}>
                <View style={{ width: 75, height: 90, borderRadius: 8, backgroundColor: "#40647c" }} />
                <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 5 }}>{[0, 1, 2].map(i => <View key={i} style={{ height: 17, borderRadius: 8, backgroundColor: i === 0 ? accent : "#668297" }} />)}</View>
              </View> : <Text style={{ color: accent, fontSize: 64, textAlign: "center" }}>{index === 1 ? "</>" : "△  ◯  ▱"}</Text>}
              <Text style={{ color: ink, fontSize: 28, textAlign: "center" }}>{family.inner}</Text>
            </View>
          </Reveal>
        </View>
        <Text style={{ color: ink, fontSize: 36, fontWeight: "600" }}>{family.name}</Text>
        <Reveal show={step >= index}><Text style={{ color: accent, fontSize: 27, lineHeight: 38, textAlign: "center" }}>{family.labels}</Text></Reveal>
      </View>)}
  </View>;
}

export function ExpoDesktopLayers() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ alignItems: "center", marginTop: 28 }}>
    <Text style={{ color: ink, fontSize: 48, fontWeight: "600" }}>Your Expo project</Text>
    <View style={{ width: 2, height: 50, backgroundColor: line }} />
    <View style={{ width: 1080, height: 2, backgroundColor: line }} />
    <View style={{ flexDirection: "row" }}>{["Mobile", "Web", "macOS", "Windows"].map((name, index) => <Reveal key={name} show={index < 2 || step > 0}>
      <View style={{ width: 360, alignItems: "center", gap: 22 }}>
        <View style={{ height: 62, width: 2, backgroundColor: line }} />
        <Text style={{ color: index < 2 ? ink : accent, fontSize: 40 }}>{name}</Text>
      </View>
    </Reveal>)}</View>
    <View style={{ marginTop: 40 }}><Reveal show={step > 0}><Text style={{ color: accent, fontSize: 32 }}>Expo Desktop → native desktop projects</Text></Reveal></View>
    <View style={{ marginTop: 30 }}><Reveal show={step > 1}><Text style={{ color: ink, fontSize: 34 }}>Legend Frame → desktop APIs + runtime + builds</Text></Reveal></View>
    <Text style={{ color: ink, fontSize: 23, marginTop: 40 }}>Community project · github.com/shirakaba/expo-desktop</Text>
  </View>;
}

export function CompatibilitySnapshot() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ gap: 54, marginTop: 36, paddingHorizontal: 100 }}>
    {[
      ["Clipboard · Secure storage · Linking", "Expo-shaped APIs", "Partial Frame adapters"],
      ["Margelo Runtimes", "Independent Hermes workers", "macOS · local patches"],
      ["The rest of the ecosystem", "Help us audit and upstream support", "Windows validation pending"],
    ].map(([name, description, status], index) => <Reveal key={name} show={step >= index}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ gap: 12 }}><Text style={{ color: ink, fontSize: 38 }}>{name}</Text><Text style={{ color: ink, fontSize: 26 }}>{description}</Text></View>
        <Text style={{ color: accent, fontSize: 28 }}>{status}</Text>
      </View>
    </Reveal>)}
  </View>;
}

export function SlidesRelease({ icon }: { icon: string }) {
  return <View style={{ alignItems: "center", gap: 24 }}>
    <Image source={{ uri: icon }} style={{ width: 210, height: 210 }} />
    <Text style={{ color: ink, fontSize: 76, fontWeight: "600" }}>Legend Slides</Text>
    <Text style={{ color: accent, fontSize: 44 }}>Open source · 0.0.1</Text>
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
