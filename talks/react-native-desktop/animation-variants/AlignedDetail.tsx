import { PlaybackKeyframeView } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import nativePoster from "../rnconnection-assets/framework-recordings/react-native.png";
import { detailCrops } from "../NineAppsTour";

export function AlignedNativeDetail({ detail }: { detail: "sidebar" | "composer" }) {
  const crop = detail === "sidebar" ? { x: 0.005, y: 0.035, width: 0.21, height: 0.50 }
    : { x: 0.265, y: 0.885, width: 0.675, height: 0.09 };
  const target = detailCrops[detail];
  const targetWidth = Math.min(1696, target.width * 1560 * 3);
  const width = targetWidth / crop.width;
  const height = width * 1440 / 2560;
  const viewportHeight = Math.min(780, crop.height * height);
  return <PlaybackKeyframeView previewTime={3} keyframes={[
    { time: 0, x: 0, y: 0, opacity: 0 }, { time: 950, x: 0, y: 0, opacity: 0 },
    { time: 1450, x: 0, y: 0, opacity: 1 }, { time: 2700, x: 0, y: 0, opacity: 1 },
    { time: 3300, x: 0, y: 0, opacity: 0 },
  ]} style={{ position: "absolute", left: (1920 - targetWidth) / 2, top: (1080 - viewportHeight) / 2,
    width: targetWidth, height: viewportHeight, overflow: "hidden", backgroundColor: "#0b1520", zIndex: 2600 }}>
    <Image source={{ uri: nativePoster }} resizeMode="stretch" style={{ position: "absolute", width, height,
      left: -crop.x * width, top: -crop.y * height }} />
    <View style={{ position: "absolute", right: 25, bottom: 20, padding: 14, borderRadius: 16, backgroundColor: "#000000cc" }}>
      <Text style={{ color: "#67e8f9", fontSize: 34 }}>React Native</Text>
    </View>
  </PlaybackKeyframeView>;
}
