import { Image, Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

// Historical measurements from the RNL 2025 deck, not the current Music build.
const comparisons = {
  cpu: {
    label: "CPU",
    imageWidth: 566,
    imageHeight: 626,
    rows: [["Spotify", "26%"], ["Apple Music", "2%"], ["Legend Music", "2%"]],
  },
  memory: {
    label: "Memory",
    imageWidth: 668,
    imageHeight: 558,
    rows: [["Spotify", "806 MB"], ["Apple Music", "149 MB"], ["Legend Music", "72 MB"]],
  },
};
const tablePanels = [{ x: 0, y: 0, width: 680, height: 420, radius: 32 }];
const sizePanels = [{ x: 0, y: 0, width: 680, height: 290, radius: 32 },
  { x: 736, y: 0, width: 680, height: 290, radius: 32 }];

export function MusicPerformance({ metric, capture }: { metric: "cpu" | "memory" | "size"; capture: string }) {
  if (metric === "size") return <View style={{ width: 1696, height: 670, alignSelf: "center", alignItems: "center", justifyContent: "center", gap: 64 }}>
    <View style={{ width: 1416, height: 290, flexDirection: "row", gap: 56 }}>
      <GlassPanels panels={sizePanels} width={1416} height={290} />
      {[["Installed app", "35 MB"], ["Zipped download", "11 MB"]].map(([label, value]) =>
        <View key={label} style={{ width: 680, height: 290, justifyContent: "center", alignItems: "center", gap: 24 }}>
          <Text className="text-3xl text-zinc-300">{label}</Text>
          <Text style={{ color: "white", fontSize: 100, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{value}</Text>
        </View>)}
    </View>
    <Image source={{ uri: capture }} style={{ width: 1122, height: 255, borderRadius: 24 }}
      resizeMode="contain" accessibilityLabel="Original RNL 2025 Finder capture: Legend Music is 35.3 MB, and its zip is 11.4 MB" />
  </View>;

  const comparison = comparisons[metric];
  const imageHeight = Math.min(626, comparison.imageHeight * 1.1);
  return <View style={{ width: 1696, height: 670, alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 96 }}>
    <View style={{ width: 680, height: 420 }}>
      <GlassPanels panels={tablePanels} width={680} height={420} />
      <View style={{ height: 96, paddingHorizontal: 40, flexDirection: "row", alignItems: "center" }}>
        <Text className="flex-1 text-3xl text-zinc-300">App</Text>
        <Text className="text-3xl text-zinc-300">{comparison.label}</Text>
      </View>
      {comparison.rows.map(([app, value]) => <View key={app} style={{ height: 108, paddingHorizontal: 40,
        flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#ffffff18" }}>
        <Text style={{ flex: 1, color: "white", fontSize: 38, fontWeight: app === "Legend Music" ? "700" : "500" }}>{app}</Text>
        <Text style={{ color: "white", fontSize: 44, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{value}</Text>
      </View>)}
    </View>
    <Image source={{ uri: capture }}
      style={{ width: imageHeight * comparison.imageWidth / comparison.imageHeight, height: imageHeight, borderRadius: 24 }}
      resizeMode="contain" accessibilityLabel={`Original RNL 2025 Activity Monitor capture of ${comparison.label.toLowerCase()} usage while playing a local MP3`} />
  </View>;
}
