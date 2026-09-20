import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
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
