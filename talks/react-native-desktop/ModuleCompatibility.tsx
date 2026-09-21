import { SceneMotionView, SharedElement, usePresentationValue } from "@legend-apps/presentation";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import snapshot from "./rnconnection-assets/module-compatibility.json";

const statusStyle = {
  working: { symbol: "●", label: "Working", color: "#72efac" },
  partial: { symbol: "◐", label: "Partial", color: "#ffd383" },
  unsupported: { symbol: "×", label: "Unsupported", color: "#ff929f" },
  untested: { symbol: "?", label: "Untested", color: "#b5c3d5" },
};
type Status = keyof typeof statusStyle;
type Row = { name: string; macos: string; windows: string };
const expoRows: Row[] = [
  snapshot.expo.find(row => row.name === "@expo/metro-runtime")!,
  ...["Clipboard", "SecureStore", "Linking"].map(name => ({ name: `${name} · Frame adapter`, macos: "partial", windows: "untested" })),
  ...["expo-image", "expo-camera"].map(name => snapshot.expo.find(row => row.name === name)!),
];

// Keep the shared marker outside animated ancestors. Both slides use identical
// typography and bounds, so their crossfade reads as one moving label.
export function ExistingModulesTitle({ inCard = false, expanded = true }: { inCard?: boolean; expanded?: boolean }) {
  return <SharedElement id="existing-modules-title" resize="preserve"
    style={{ width: 1696, height: 92, ...(inCard ? { position: "absolute", top: 286, left: 0 } : {}) }}>
    <SceneMotionView duration={850} pose={{ y: inCard && !expanded ? -35 : 0, scaleX: inCard && !expanded ? 42 / 72 : 1, scaleY: inCard && !expanded ? 42 / 72 : 1 }}>
      <Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 92, fontWeight: "600", textAlign: "center", letterSpacing: -1.8 }}>Existing Modules</Text>
    </SceneMotionView>
  </SharedElement>;
}
function StatusCell({ value }: { value: string }) {
  const status = statusStyle[value as Status];
  return <Text style={{ width: 260, color: status.color, fontSize: 27, textAlign: "center" }}>{status.symbol}  {status.label}</Text>;
}
function CompatibilityTable({ rows }: { rows: Row[] }) {
  return <View>
    <View style={{ flexDirection: "row", paddingBottom: 16 }}>
      <Text style={{ flex: 1, color: "#aab8cc", fontSize: 27 }}>Library</Text>
      {["macOS", "Windows"].map(name => <Text key={name} style={{ width: 260, textAlign: "center", color: "#ffffff", fontSize: 30, fontWeight: "600" }}>{name}</Text>)}
    </View>
    {rows.map(row => <View key={row.name} style={{ flexDirection: "row", alignItems: "center", height: 46, borderTopWidth: 1, borderTopColor: "#ffffff15" }}>
      <Text style={{ flex: 1, color: "#f8fafc", fontSize: 27 }}>{row.name}</Text>
      <StatusCell value={row.macos} /><StatusCell value={row.windows} />
    </View>)}
  </View>;
}
function CompatibilityPage({ community }: { community: boolean }) {
  const [auditOpen, setAuditOpen] = useState(false);
  return <View style={{ width: 1450, alignSelf: "center", marginTop: 25, height: 650 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
      <Text style={{ color: "#8be5ff", fontSize: 32, fontWeight: "600" }}>{auditOpen ? "Expo · Directory audit" : community ? "Community libraries" : "Expo + Frame adapters"}</Text>
      <Pressable accessibilityRole="button" onPress={() => setAuditOpen(!auditOpen)}>
        <Text style={{ color: "#8be5ff", fontSize: 27 }}>{auditOpen ? "← Back" : "Full Expo audit ↗"}</Text>
      </Pressable>
    </View>
    {auditOpen ? <ScrollView style={{ height: 490 }}><CompatibilityTable rows={snapshot.expo} /></ScrollView>
      : <View style={{ height: 510 }}><CompatibilityTable rows={community ? snapshot.community : expoRows} /></View>}
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
      {Object.entries(statusStyle).map(([key, status]) => <Text key={key} style={{ color: status.color, fontSize: 23 }}>{status.symbol} {status.label}</Text>)}
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL("https://reactnative.directory/")}><Text style={{ color: "#8be5ff", fontSize: 23 }}>reactnative.directory ↗</Text></Pressable>
    </View>
  </View>;
}
export function CompatibilitySnapshot() {
  const step = usePresentationValue("stepIndex");
  return <CompatibilityPage key={step} community={step > 0} />;
}
