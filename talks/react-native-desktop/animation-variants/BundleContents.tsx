import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { HelloSizeJourney } from "./HelloSizeJourney";
import { Arrive } from "./Motion";

export function HelloSizeJourneyB() {
  const peel = usePresentationValue("stepIndex") >= 6;
  return <View style={{ width: 1696, height: 740 }}>
    <SceneMotionView pose={{ opacity: peel ? 0.08 : 1 }} duration={700}><HelloSizeJourney /></SceneMotionView>
    {peel && <View style={{ position: "absolute", top: 140, left: 40, flexDirection: "row", gap: 45 }}>
      {[
        { title: "Native platform", layers: ["Your app", "OS frameworks"], color: "#a5b4fc" },
        { title: "React Native", layers: ["Your app", "Hermes + React Native"], color: "#67e8f9" },
        { title: "Electron", layers: ["Your app", "Node.js", "Chromium"], color: "#fda4af" },
      ].map((bundle, i) => <View key={bundle.title} style={{ width: 510, height: 500 }}>
        <Text style={{ fontSize: 40, color: bundle.color, textAlign: "center", marginBottom: 55 }}>{bundle.title}</Text>
        {bundle.layers.map((label, j) => <Arrive key={label} delay={i * 200 + j * 180} clock="step" fromY={-(bundle.layers.length - j) * 70}
          style={{ marginTop: 24, height: 100, borderRadius: 20, borderWidth: 2, borderColor: bundle.color,
            backgroundColor: "#142a3b", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "white", fontSize: 34 }}>{label}</Text>
        </Arrive>)}
      </View>)}
    </View>}
  </View>;
}
