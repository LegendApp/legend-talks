import { Image, Text, View } from "react-native";
import type { ReactNode } from "react";
import { SceneMotionView, SharedElement } from "@legend-apps/presentation";
import { GlassPanels } from "./GlassPanels";
import { MovingTitle } from "./MovingTitle";

// Historical measurements from the RNL 2025 deck, not the current Music build.
const comparisons = {
  cpu: {
    label: "CPU",
    rows: [["Spotify", "26%"], ["Apple Music", "2%"], ["Legend Music", "2%"]],
  },
  memory: {
    label: "Memory",
    rows: [["Spotify", "806 MB"], ["Apple Music", "149 MB"], ["Legend Music", "72 MB"]],
  },
};
const tablePanels = [{ x: 0, y: 0, width: 680, height: 420, radius: 32 }];
const sizePanels = [{ x: 0, y: 0, width: 680, height: 290, radius: 32 },
  { x: 736, y: 0, width: 680, height: 290, radius: 32 }];
const sizeComparisonPanels = [0, 568, 1136].map(x => ({ x, y: 0, width: 528, height: 290, radius: 32 }));
const titleTextStyle = { color: "#f8fafc", fontSize: 72, lineHeight: 90, fontWeight: "600", letterSpacing: -1.8 } as const;

export function MusicPerformanceTitle({ metric }: { metric: "cpu" | "memory" }) {
  return <View accessible accessibilityRole="header" accessibilityLabel={`Legend Music · ${metric === "cpu" ? "CPU" : "memory"}`}
    style={{ width: 1696, height: 90, marginBottom: 36, alignSelf: "center", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
    <MovingTitle>
      <Text style={titleTextStyle}>Legend Music ·</Text>
    </MovingTitle>
    <View style={{ width: 320, height: 90, marginLeft: 16, overflow: "hidden" }}>
      <SceneMotionView initialPose={{ y: 90, opacity: 0 }} pose={{ y: 0, opacity: 1 }} duration={650}>
        <Text style={[titleTextStyle, { textAlign: "left" }]}>{metric === "cpu" ? "CPU" : "memory"}</Text>
      </SceneMotionView>
    </View>
  </View>;
}

export function MusicPerformance({ metric, capture, installedSize = "35 MB", zippedSize = "11 MB", spotifyInstalledSize }: {
  metric: "cpu" | "memory" | "size";
  capture?: string;
  installedSize?: ReactNode;
  zippedSize?: ReactNode;
  spotifyInstalledSize?: string;
}) {
  const sizeRows: [string, ReactNode][] = spotifyInstalledSize
    ? [["Spotify installed", spotifyInstalledSize], ["Legend Music installed", installedSize], ["Legend Music zipped", zippedSize]]
    : [["Installed app", installedSize], ["Zipped download", zippedSize]];
  const panelWidth = spotifyInstalledSize ? 528 : 680;
  const panelsWidth = spotifyInstalledSize ? 1664 : 1416;
  if (metric === "size") return <View style={{ width: 1696, height: 670, alignSelf: "center", alignItems: "center", justifyContent: "center", gap: 64 }}>
    <View style={{ width: panelsWidth, height: 290, flexDirection: "row", gap: spotifyInstalledSize ? 40 : 56 }}>
      <GlassPanels panels={spotifyInstalledSize ? sizeComparisonPanels : sizePanels} width={panelsWidth} height={290} />
      {sizeRows.map(([label, value]) =>
        <View key={label} style={{ width: panelWidth, height: 290, justifyContent: "center", alignItems: "center", gap: 24 }}>
          <Text className="text-3xl text-zinc-300">{label}</Text>
          {typeof value === "string" ? <Text style={{ color: "white", fontSize: 100, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{value}</Text> : value}
        </View>)}
    </View>
    {capture && <Image source={{ uri: capture }} style={{ width: 1122, height: 255, borderRadius: 24 }}
      resizeMode="contain" accessibilityLabel="Original RNL 2025 Finder capture: Legend Music is 35.3 MB, and its zip is 11.4 MB" />}
  </View>;

  const comparison = comparisons[metric];
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
    <SharedElement id="legend-music-capture" style={{ width: 566, height: 626 }}>
      <Image source={{ uri: capture }} style={{ width: "100%", height: "100%", borderRadius: 24 }}
        resizeMode="contain" accessibilityLabel={`Original RNL 2025 Activity Monitor capture of ${comparison.label.toLowerCase()} usage while playing a local MP3`} />
    </SharedElement>
  </View>;
}
