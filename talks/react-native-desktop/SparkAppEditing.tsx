import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

const promptPanel = [{ x: 0, y: 0, width: 1696, height: 140, radius: 28 }];

/** Illustrated demo storyboard; replace with real captures after choosing an app. */
function SettingsIllustration({ compact }: { compact: boolean }) {
  return <View style={{ width: 800, height: 470, borderRadius: 24, overflow: "hidden", backgroundColor: "#202124", borderWidth: 1, borderColor: "#ffffff30" }}>
    <View style={{ height: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: 24, gap: 12, backgroundColor: "#ffffff08" }}>
      {["#ff6058", "#ffbd2e", "#28c840"].map(color => <View key={color} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} />)}
      <Text style={{ color: "white", fontSize: 26, fontWeight: "600", marginLeft: 24 }}>Legend Music · Settings</Text>
    </View>
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ width: 225, padding: 20, gap: 16, backgroundColor: "#ffffff06" }}>
        {["General", "Appearance", "Playback", "Customize app"].map(label => <View key={label}
          style={{ paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, backgroundColor: label === "Playback" ? "#ffffff15" : "transparent" }}>
          <Text style={{ color: label === "Playback" ? "white" : "#b5b6bb", fontSize: 23 }}>{label}</Text>
        </View>)}
      </View>
      <View style={{ flex: 1, padding: 28, gap: 24 }}>
        <Text style={{ color: "white", fontSize: 34, fontWeight: "600" }}>Playback</Text>
        <View style={{ padding: 20, borderRadius: 16, gap: 22, backgroundColor: "#ffffff08" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#e5e5e7", fontSize: 25 }}>Crossfade</Text>
            <Text style={{ color: "#b5b6bb", fontSize: 25 }}>Off</Text>
          </View>
          <View style={{ height: 1, backgroundColor: "#ffffff15" }} />
          <Text style={{ color: "#e5e5e7", fontSize: 25 }}>Volume</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: "#ffffff25" }}>
            <View style={{ width: "70%", height: 8, borderRadius: 4, backgroundColor: "#d5d5db" }} />
          </View>
        </View>
        {compact && <View style={{ padding: 20, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff08", borderWidth: 1, borderColor: "#8be2b055" }}>
          <Text style={{ color: "white", fontSize: 25 }}>Compact player mode</Text>
          <View style={{ width: 58, height: 32, padding: 4, borderRadius: 16, backgroundColor: "#78c798", alignItems: "flex-end" }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "white" }} />
          </View>
        </View>}
      </View>
    </View>
  </View>;
}

export function SparkAppEditing() {
  const step = usePresentationValue("stepIndex");
  const preview = step >= 1;
  const applied = step >= 2;
  return <View style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 24 }}>
    <GlassPanels panels={promptPanel} width={1696} height={140} />
    <View style={{ height: 140, padding: 28, flexDirection: "row", gap: 32, alignItems: "center" }}>
      <View style={{ flex: 1, gap: 10 }}>
        <Text style={{ fontSize: 24, color: "#c3c4ca" }}>Customize app</Text>
        <Text style={{ fontSize: 34, color: "white", fontWeight: "500" }}>Add a compact player mode in Playback settings.</Text>
      </View>
      <View style={{ width: 160, paddingVertical: 16, borderRadius: 12, backgroundColor: preview ? "#ffffff22" : "#ffffff12", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 28 }}>Preview</Text>
      </View>
      <View style={{ width: 160, paddingVertical: 16, borderRadius: 12, backgroundColor: applied ? "#78c798" : "#ffffff12", alignItems: "center" }}>
        <Text style={{ color: applied ? "#15251b" : preview ? "white" : "#7b7c82", fontSize: 28 }}>{applied ? "Applied ✓" : "Apply"}</Text>
      </View>
    </View>
    <View style={{ marginTop: 40, flexDirection: "row", justifyContent: "space-between" }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: "#d7d7dc", fontSize: 32 }}>Before</Text>
        <SettingsIllustration compact={false} />
      </View>
      <View style={{ width: 800, gap: 16 }}>
        <Text style={{ color: "#d7d7dc", fontSize: 32 }}>{applied ? "After" : "Preview"}</Text>
        <SceneMotionView pose={{ opacity: preview ? 1 : 0 }} hidden={!preview} duration={450}>
          <SettingsIllustration compact />
        </SceneMotionView>
      </View>
    </View>
  </View>;
}
