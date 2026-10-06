import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";

export function SparkAppEditingScreenshots({ before, after }: { before: string; after: string }) {
  const revealed = usePresentationValue("stepIndex") >= 1;
  return <View style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 24, gap: 24 }}>
    <Text style={{ color: "white", fontSize: 34, lineHeight: 48, textAlign: "center" }}>
      Change the Settings appearance text color to #58D6C7.
    </Text>
    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
      <View style={{ width: 800, alignItems: "center", gap: 16 }}>
        <Text style={{ color: "#d7d7dc", fontSize: 32 }}>Before</Text>
        <Image source={{ uri: before }} style={{ width: 743.125, height: 580, borderRadius: 24 }}
          resizeMode="contain" accessibilityLabel="Legend Diff Customize App settings before the color change, with gray appearance text" />
      </View>
      <SceneMotionView pose={{ opacity: revealed ? 1 : 0 }} hidden={!revealed} duration={450}>
        <View style={{ width: 800, alignItems: "center", gap: 16 }}>
          <Text style={{ color: "#d7d7dc", fontSize: 32 }}>After</Text>
          <Image source={{ uri: after }} style={{ width: 743.125, height: 580, borderRadius: 24 }}
            resizeMode="contain" accessibilityLabel="Legend Diff Customize App settings after keeping the edit: teal appearance text and a saved Update Settings text color change" />
        </View>
      </SceneMotionView>
    </View>
  </View>;
}
