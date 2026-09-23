import { Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

// npm latest dist-tags, verified September 23, 2026. Preview/RC tags excluded.
const platforms = [
  { name: "iOS + Android", version: "0.87.1", color: "#67e8f9" },
  { name: "macOS", version: "0.81.9", color: "#fbbf77" },
  { name: "Windows", version: "0.84.0", color: "#fbbf77" },
];
const panels = platforms.map((_, index) => ({ x: index * 574, y: 100, width: 548, height: 400, radius: 32 }));

export function PlatformVersions() {
  return <View style={{ width: 1696, height: 650, alignSelf: "center" }}>
    <GlassPanels panels={panels} width={1696} height={650} pulse={0.004} edgeMotion={0.5} />
    {platforms.map((platform, index) => <View key={platform.name} style={{ position: "absolute",
      left: index * 574, top: 100, width: 548, height: 400, alignItems: "center", justifyContent: "center", gap: 40 }}>
      <Text style={{ color: "#f1f5f9", fontSize: 46, fontWeight: "600" }}>{platform.name}</Text>
      <Text style={{ color: platform.color, fontSize: 104, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{platform.version}</Text>
    </View>)}
  </View>;
}
