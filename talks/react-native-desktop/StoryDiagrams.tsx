import { Text, View } from "react-native";

const ink = "#f1f5f9";
const accent = "#8be5ff";
const panel = { backgroundColor: "rgba(17,30,45,0.92)", borderColor: "rgba(255,255,255,0.35)", borderWidth: 1, borderRadius: 24, padding: 30, gap: 24 };

export function StoryCards({ items }: { items: { title: string; body: string }[] }) {
  return <View style={{ flexDirection: "row", gap: 26, marginTop: 32 }}>
    {items.map(({ title, body }) => <View key={title} style={{ ...panel, flex: 1, minHeight: 230 }}>
      <Text style={{ color: accent, fontSize: 36, fontWeight: "600" }}>{title}</Text>
      <Text style={{ color: ink, fontSize: 30, lineHeight: 42 }}>{body}</Text>
    </View>)}
  </View>;
}

function Layer({ title, detail }: { title: string; detail: string }) {
  return <View style={{ ...panel, padding: 22, width: "100%", alignItems: "center", gap: 12 }}>
    <Text style={{ color: accent, fontSize: 34, fontWeight: "600" }}>{title}</Text>
    <Text style={{ color: ink, fontSize: 28, textAlign: "center" }}>{detail}</Text>
  </View>;
}

export function SharedFoundation() {
  return <View style={{ gap: 20, marginTop: 24 }}>
    <StoryCards items={[
      { title: "Chat History", body: "Conversations + transcripts" },
      { title: "Code", body: "Source files + editing" },
      { title: "Diff", body: "Changes + comparisons" },
    ]} />
    <Text style={{ color: accent, textAlign: "center", fontSize: 36 }}>↓                 ↓                 ↓</Text>
    <Layer title="Shared native capabilities" detail="Windows · menus · files · storage · editors and parsers" />
    <Layer title="Reusable host + build tooling" detail="Each app selects the capabilities it needs." />
  </View>;
}

export function RendererFamilies() {
  return <View style={{ gap: 28 }}>
    <StoryCards items={[
      { title: "Platform views", body: "AppKit → macOS controls\nSwiftUI → Apple UI\nReact Native → native views" },
      { title: "Browser content", body: "Electron → Chromium + Node\nTauri → system WebView + Rust\nDeno → WebView or CEF" },
      { title: "Framework-drawn", body: "Flutter → Dart + engine\nCompose → Kotlin/JVM + Skia\nGPUI → Rust + GPU renderer" },
    ]} />
    <Text style={{ color: ink, fontSize: 30, textAlign: "center" }}>A native window does not tell you how its content is drawn.</Text>
    <Text style={{ color: ink, fontSize: 24, textAlign: "center" }}>Visual tour: one Deno + Compose. Measured charts: two Deno variants; no Compose.</Text>
  </View>;
}

export function ExpoDesktopLayers() {
  return <View style={{ gap: 22, marginTop: 24 }}>
    <Layer title="Expo Desktop · community project" detail="Create the project → generate macOS / Windows native projects" />
    <Layer title="Expo CLI" detail="Metro · development terminal · existing mobile and web workflow" />
    <Layer title="Legend Frame" detail="Desktop APIs · runtime compatibility · build and launch orchestration" />
    <Text style={{ color: ink, fontSize: 26, textAlign: "center" }}>Built on React Native macOS and React Native Windows</Text>
    <Text style={{ color: accent, fontSize: 24, textAlign: "center" }}>github.com/shirakaba/expo-desktop</Text>
  </View>;
}

export function CompatibilitySnapshot() {
  return <View style={{ gap: 26 }}>
    <StoryCards items={[
      { title: "Expo-shaped APIs", body: "Clipboard · secure storage · linking\n\nSupported subsets via Frame adapters. Not the complete Expo modules." },
      { title: "Margelo Runtimes", body: "Independent Hermes workers\n\nmacOS integration validated locally with pinned patches and adapters." },
    ]} />
    <Text style={{ color: ink, fontSize: 28, textAlign: "center" }}>More Margelo support is in progress. Windows native validation is pending.</Text>
    <Text style={{ color: accent, fontSize: 28, textAlign: "center" }}>Works upstream ≠ works with patches ≠ partial adapter</Text>
  </View>;
}
