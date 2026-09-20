import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

const platforms = ["iOS", "Android", "Web", "macOS", "Windows"];
const platformPanels = platforms.map((_, index) => ({ x: 38 + index * 330, y: 290, width: 300, height: 150, radius: 28 }));
export function ExpoDesktopGap() {
  return <View style={{ width: 1696, height: 620, marginTop: 36, alignSelf: "center" }}>
    <Text style={{ color: "#ffffff", textAlign: "center", fontSize: 58, fontWeight: "600" }}>Your Expo project</Text>
    <View style={{ position: "absolute", left: 847, top: 96, width: 2, height: 124, backgroundColor: "#7cdbf5" }} />
    <View style={{ position: "absolute", left: 188, top: 220, width: 1320, height: 2, backgroundColor: "#466a85" }} />
    <GlassPanels panels={platformPanels} width={1696} height={620} />
    {platforms.map((name, index) => <View key={name} style={{ position: "absolute", left: 38 + index * 330, top: 220, width: 300, alignItems: "center" }}>
      <View style={{ height: 70, borderLeftWidth: 2, borderStyle: index < 3 ? "solid" : "dashed", borderColor: index < 3 ? "#7cdbf5" : "#fda4af" }} />
      <Text style={{ marginTop: 25, fontSize: 36, color: "#ffffff", fontWeight: "600" }}>{name}</Text>
      <Text style={{ marginTop: 12, fontSize: 25, color: index < 3 ? "#8de4ff" : "#fda4af" }}>{index < 3 ? "Familiar workflow" : "Gaps to fill"}</Text>
    </View>)}
    <Text style={{ position: "absolute", top: 495, width: 1696, textAlign: "center", color: "#c6d7e8", fontSize: 32 }}>Project setup · Native modules · Build workflow</Text>
  </View>;
}

const capabilities = ["Multiple windows", "Native menus", "Keyboard shortcuts", "Files & folders", "Open / save dialogs", "Drag & drop", "Clipboard", "Notifications", "Tray / menu bar", "Media controls", "Deep links", "App lifecycle", "Preferences", "Permissions", "Distribution & updates"];
export function DesktopModulesChecklist() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1696, height: 660, marginTop: 36, alignSelf: "center" }}>
    {capabilities.map((label, index) => {
      const visible = Math.floor(index / 5) <= step;
      return <SceneMotionView key={label} pose={{ opacity: visible ? 1 : 0.12, y: visible ? 0 : 12 }} duration={450}
        style={{ position: "absolute", left: Math.floor(index / 5) * 564 + 24, top: (index % 5) * 114, width: 540, height: 90, flexDirection: "row", alignItems: "center", gap: 20 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#85e5ff", shadowColor: "#58cfff", shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }} />
        <Text style={{ color: "#f5f9ff", fontSize: 34, lineHeight: 44 }}>{label}</Text>
      </SceneMotionView>;
    })}
  </View>;
}
