import { SceneMotionView, SharedElement } from "@legend-apps/presentation";
import { Linking, Pressable, Text, View } from "react-native";
import snapshot from "./rnconnection-assets/module-compatibility.json";

const statusStyle = {
  working: { symbol: "●", label: "Working", color: "#72efac" },
  partial: { symbol: "◐", label: "Partial", color: "#ffd383" },
  unsupported: { symbol: "×", label: "Unsupported", color: "#ff929f" },
  "in-progress": { symbol: "◌", label: "In progress", color: "#ffd383" },
  untested: { symbol: "?", label: "?", color: "#b5c3d5" },
};
type Status = keyof typeof statusStyle;
type Row = { name: string; macos: string; windows: string };
// Keep the shared marker outside animated ancestors. Both slides use identical
// typography and bounds, so their crossfade reads as one moving label.
export function ExistingModulesTitle({ inCard = false, expanded = true, title = "Existing Modules" }: { inCard?: boolean; expanded?: boolean; title?: string }) {
  return <SharedElement id="existing-modules-title" resize="preserve"
    style={{ width: 1696, height: 92, ...(inCard ? { position: "absolute", top: 286, left: 0 } : {}) }}>
    <SceneMotionView duration={850} pose={{ y: inCard && !expanded ? -35 : 0, scaleX: inCard && !expanded ? 42 / 72 : 1, scaleY: inCard && !expanded ? 42 / 72 : 1 }}>
      <Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 92, fontWeight: "600", textAlign: "center", letterSpacing: -1.8 }}>{title}</Text>
    </SceneMotionView>
  </SharedElement>;
}
function StatusCell({ value, compact }: { value: string; compact: boolean }) {
  const status = statusStyle[value as Status];
  return <View accessible accessibilityLabel={status.label} style={{ width: compact ? 150 : 280, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
    <Text style={{ color: status.color, fontSize: value === "in-progress" ? 46 : compact ? 36 : 32, lineHeight: 50 }}>{status.symbol}</Text>
    {!compact && value !== "untested" && <Text numberOfLines={1} style={{ color: status.color, fontSize: 32 }}>{status.label}</Text>}
  </View>;
}
function CompatibilityTable({ rows, compact = false }: { rows: Row[]; compact?: boolean }) {
  return <View>
    <View style={{ flexDirection: "row", paddingBottom: 16 }}>
      <Text style={{ flex: 1, color: "#aab8cc", fontSize: 32 }}>Library</Text>
      {["macOS", "Windows"].map(name => <Text key={name} numberOfLines={1} style={{ width: compact ? 150 : 280, flexShrink: 0, textAlign: "center", color: "#ffffff", fontSize: 32, fontWeight: "600" }}>{name}</Text>)}
    </View>
    {rows.map(row => <View key={row.name} style={{ flexDirection: "row", alignItems: "center", height: compact ? 68 : 52, borderTopWidth: 1, borderTopColor: "#ffffff15" }}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ flex: 1, color: "#f8fafc", fontSize: compact ? 32 : 36 }}>{row.name}</Text>
      <StatusCell value={row.macos} compact={compact} /><StatusCell value={row.windows} compact={compact} />
    </View>)}
  </View>;
}
export function CompatibilitySnapshot({ expo = false }: { expo?: boolean }) {
  const rows = expo ? snapshot.expoFeatured : snapshot.community;
  const split = Math.ceil(rows.length / 2);
  return <View style={{ width: 1696, alignSelf: "center", marginTop: 25, height: 720 }}>
    <View style={{ height: 640 }}>
      {!expo ? <CompatibilityTable rows={rows} /> : <View style={{ flexDirection: "row", gap: 40 }}>
        {[rows.slice(0, split), rows.slice(split)].map((rows, index) =>
          <View key={index} style={{ flex: 1 }}><CompatibilityTable rows={rows} compact /></View>)}
      </View>}
    </View>
    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 18 }}>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL("https://reactnative.directory/")}><Text style={{ color: "#8be5ff", fontSize: 26 }}>reactnative.directory ↗</Text></Pressable>
    </View>
  </View>;
}
