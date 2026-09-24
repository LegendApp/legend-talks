import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, View } from "react-native";
// @ts-ignore Local deck image resolves to a file URL.
import screenshot from "./rnconnection-assets/spark-runner-cli.png";

const scale = 760 / 1278;
const width = 1140 * scale;
// Source-image bands: preserve the actual screenshot text for g, d and b.
const dimBands = [[0, 812], [848, 962], [1028, 1278]];
const highlights = [[812, 848], [962, 996], [996, 1028]];

export function FrameRunnerDemo() {
  const focused = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 760, alignSelf: "center", overflow: "hidden" }}>
    <SceneMotionView pose={{ scaleX: focused ? 2.45 : 1, scaleY: focused ? 2.45 : 1,
      x: focused ? 144 : 0, y: focused ? -410 : 0 }} duration={1000}
      style={{ position: "absolute", left: (1696 - width) / 2, width, height: 760 }}>
      <Image source={{ uri: screenshot }} style={{ width, height: 760, borderRadius: 16 }} resizeMode="contain"
        accessibilityLabel="Spark Runner CLI. Press g: switch desktop to development build. Press d: open macOS in Spark Runner. Press b: build and open macOS development build." />
      <SceneMotionView pose={{ opacity: focused ? 1 : 0 }} duration={850} style={{ position: "absolute", inset: 0 }}>
        {dimBands.map(([top, bottom]) => <View key={top} style={{ position: "absolute", left: 0, right: 0,
          top: top * scale, height: (bottom - top) * scale, backgroundColor: "#181818d9" }} />)}
        {highlights.map(([top, bottom]) => <View key={top} style={{ position: "absolute", left: 5 * scale,
          width: 805 * scale, top: top * scale, height: (bottom - top) * scale,
          borderLeftWidth: 2, borderColor: "#84eaff", backgroundColor: "#62dfff0c" }} />)}
      </SceneMotionView>
    </SceneMotionView>
  </View>;
}
