import type { ReactNode } from "react";
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
    <View style={{ position: "absolute", bottom: 28, width: 1696, flexDirection: "row" }}>
      {[["Native views", "OS UI toolkit"], ["Browser content", "HTML + CSS"], ["Framework-drawn", "Custom renderer"]].map(([title, caption]) =>
        <View key={title} style={{ flex: 1, alignItems: "center", gap: 12 }}>
          <Text style={{ color: "#f8fafc", fontSize: 36, fontWeight: "600" }}>{title}</Text>
          <Text style={{ color: "#e5f2fa", fontSize: 28 }}>{caption}</Text>
        </View>)}
    </View>
  </View>;
}

export function AlternateEcosystem({ children }: { children: ReactNode }) {
  return <View style={{ width: 1696, height: 700, marginTop: 30 }}>
    {children}
    <View style={{ position: "absolute", left: 630, top: 275, width: 436, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: "#96dfff", backgroundColor: "#102333" }}>
      <Text style={{ color: "#f8fafc", fontSize: 38, fontWeight: "600", textAlign: "center" }}>Your library</Text>
    </View>
    <Text style={{ color: "#f8fafc", fontSize: 32, textAlign: "center", marginTop: 10 }}>Make desktop part of the support matrix</Text>
  </View>;
}
