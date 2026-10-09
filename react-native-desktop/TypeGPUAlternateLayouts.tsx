import { type ReactNode } from "react";
import { PlaybackKeyframeView } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";

export function AlternateRoots({ children, icons }: { children: ReactNode; icons: string[] }) {
  return <View style={{ width: 1696, height: 700, marginTop: 30 }}>
    {children}
    <View pointerEvents="none" style={{ position: "absolute", top: 0, width: 1696, flexDirection: "row", paddingHorizontal: 42 }}>
      {["Music", "Chat History", "Code", "Diff", "Markdown"].map((name, index) => <View key={name} style={{ width: 322, alignItems: "center", gap: 8 }}>
        {index === 0 ? <Text style={{ fontSize: 58, height: 72, color: "#c4a0ff" }}>♫</Text>
          : <Image source={{ uri: icons[index-1] }} style={{ width: 72, height: 72 }} />}
        <Text style={{ fontSize: 28, fontWeight: "600", color: "#f8fafc" }}>{name}</Text>
      </View>)}
    </View>
    <Text style={{ color: "#e5f2fa", fontSize: 27, textAlign: "center", marginTop: 8 }}>Windows · Menus · Files · Storage · Shortcuts · Media · OS integration</Text>
  </View>;
}

export function AlternateWindows({ children }: { children: ReactNode }) {
  return <View style={{ width: 1696, height: 710, marginTop: 18 }}>
    {children}
    <View style={{ position: "absolute", top: 0, width: 1696, flexDirection: "row" }}>
      {["Native views", "Browser content", "Canvas"].map(title => <View key={title} style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ color: "#f8fafc", fontSize: 36, fontWeight: "600" }}>{title}</Text>
      </View>)}
    </View>
    <View style={{ position: "absolute", bottom: 28, width: 1696, flexDirection: "row" }}>
      {["AppKit · SwiftUI · React Native", "Electron · Tauri · Deno", "Flutter · Compose Multiplatform · GPUI"].map(frameworks =>
        <View key={frameworks} style={{ flex: 1, alignItems: "center", paddingHorizontal: 16 }}>
          <Text style={{ color: "#e5f2fa", fontSize: 27, lineHeight: 38, textAlign: "center" }}>{frameworks}</Text>
        </View>)}
    </View>
  </View>;
}

function LibraryLabel() {
  return <PlaybackKeyframeView previewTime={14}
    keyframes={[{ time: 0, x: 0, y: 0, opacity: 1 }, { time: 10000, x: 0, y: 0, opacity: 1 }, { time: 11500, x: 0, y: 0, opacity: 0 }]}
    style={{ position: "absolute", left: 738, top: 295, width: 220, height: 60,
    borderRadius: 16, borderWidth: 1, borderColor: "#b4d6dd", backgroundColor: "#102333", justifyContent: "center" }}>
    <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "600", textAlign: "center" }}>Your library</Text>
    <PlaybackKeyframeView previewTime={14}
      keyframes={[{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 7000, x: 0, y: 0, opacity: 0 }, { time: 8000, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", inset: -1, borderRadius: 16, borderWidth: 1, borderColor: "#5af394",
      backgroundColor: "#123827", justifyContent: "center" }}>
      <Text style={{ color: "#5af394", fontSize: 28, fontWeight: "600", textAlign: "center" }}>Your library</Text>
    </PlaybackKeyframeView>
  </PlaybackKeyframeView>;
}

export function AlternateEcosystem({ children }: { children: ReactNode }) {
  return <View style={{ width: 1696, height: 700, marginTop: 30 }}>
    {children}
    <LibraryLabel />
    <Text style={{ color: "#f8fafc", fontSize: 32, textAlign: "center", marginTop: 10 }}>Make desktop part of the support matrix</Text>
  </View>;
}
