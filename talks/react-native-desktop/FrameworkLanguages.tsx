import { PlaybackKeyframeView } from "@legend-apps/presentation";
import { Text, View } from "react-native";

const groups = [
  { title: "Native UI", rows: [["React Native", "TypeScript / React"], ["AppKit", "Swift / Objective-C"], ["SwiftUI", "Swift"]] },
  { title: "Browser", rows: [["Electron", "TypeScript / web UI"], ["Tauri", "Web UI + Rust"], ["Deno", "TypeScript / web UI"]] },
  { title: "Canvas", rows: [["Flutter", "Dart"], ["Compose", "Kotlin"], ["GPUI", "Rust"]] },
];
const entrance = [
  { time: 0, x: 0, y: 22, opacity: 0 },
  { time: 320, x: 0, y: 4, opacity: 0.85 },
  { time: 600, x: 0, y: 0, opacity: 1 },
];

export function FrameworkLanguages() {
  return <View style={{ width: 1696, height: 650, marginTop: 45, alignSelf: "center", flexDirection: "row", gap: 62 }}>
    {groups.map((group, index) => <PlaybackKeyframeView key={group.title} keyframes={entrance}
      clock="slide" delay={index * 180} style={{ flex: 1 }}>
      <Text style={{ fontSize: 36, lineHeight: 48, fontWeight: "600", color: "#aab8cc", textAlign: "center" }}>{group.title}</Text>
      <View style={{ height: 1, marginTop: 22, marginBottom: 26, backgroundColor: "#67dfff88",
        shadowColor: "#39cfff", shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }} />
      {group.rows.map(([name, language]) => <View key={name} style={{ height: 156, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 43, lineHeight: 56, fontWeight: "600", color: name === "React Native" ? "#79e5ff" : "#f8fafc" }}>{name}</Text>
        <Text style={{ fontSize: 30, lineHeight: 42, color: name === "React Native" ? "#b5f2ff" : "#d8e2ef", marginTop: 8 }}>{language}</Text>
      </View>)}
    </PlaybackKeyframeView>)}
  </View>;
}
