import { usePresentation$, type PresentationTemplateProps } from "@legend-apps/presentation";
import { Pressable, Text, View } from "react-native";
import { titleEntranceEffects } from "./titleEntrancePresets";

export default function TitleTestFrame({ children, slide }: PresentationTemplateProps) {
  return <View style={{ flex: 1, backgroundColor: "#0b0d14", paddingHorizontal: 112, paddingVertical: 96, justifyContent: "center" }}>
    <View style={{ position: "absolute", top: 68, left: 112, right: 112, flexDirection: "row", alignItems: "center", gap: 24 }}>
      <View style={{ width: 8, height: 40, borderRadius: 4, backgroundColor: "#a78bfa" }} />
      <Text style={{ flex: 1, color: "#d9d7e6", fontSize: 36, fontWeight: "500" }}>{String(slide.effectLabel ?? "Title entrances")}</Text>
      <Text style={{ color: "#a78bfa", fontSize: 30, fontVariant: ["tabular-nums"] }}>{String(slide.sampleNumber ?? "16 presets")}</Text>
    </View>
    {children}
  </View>;
}

export function TitleTestIndex() {
  const presentation$ = usePresentation$();
  return <View style={{ gap: 56 }}>
    <Text style={{ color: "#f8fafc", fontSize: 76, fontWeight: "700", textAlign: "center" }}>Same title. Sixteen ways to arrive.</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
      {titleEntranceEffects.map((effect, index) => <Pressable key={effect.id} accessibilityRole="button" accessibilityLabel={effect.label}
        onPress={() => presentation$.peek().goTo(index + 1)} style={({ pressed }) => ({ width: 409, height: 104, paddingHorizontal: 24,
          backgroundColor: pressed ? "#a78bfa20" : "#ffffff06", borderColor: "#ffffff14", borderWidth: 1, borderRadius: 16,
          flexDirection: "row", alignItems: "center", gap: 18 })}>
        <Text style={{ color: "#a78bfa", fontSize: 26, fontVariant: ["tabular-nums"] }}>{String(index + 1).padStart(2, "0")}</Text>
        <Text style={{ color: "#e6e5ec", fontSize: 30 }}>{effect.label}</Text>
      </Pressable>)}
    </View>
  </View>;
}
