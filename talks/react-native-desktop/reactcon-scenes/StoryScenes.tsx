import { SceneMotionView, SharedElement, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "../MovingTitle";
import { Arrive } from "./Motion";

const ink = "#f8fafc", cyan = "#67e8f9";
const titleStyle = { color: ink, fontSize: 80, lineHeight: 104, fontWeight: "600" as const, textAlign: "center" as const };

export function Measured() {
  const measured = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 520, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: measured ? -80 : 0, opacity: measured ? 0 : 1 }} duration={500} style={{ position: "absolute", top: 190, width: 1696 }}>
      <Text style={titleStyle}>Was I just imagining it?</Text>
    </SceneMotionView>
    <SceneMotionView initialPose={{ y: 60, opacity: 0 }} pose={{ y: measured ? 0 : 60, opacity: measured ? 1 : 0 }} duration={650}>
      <MovingTitle><Text style={titleStyle}>So I measured it</Text></MovingTitle>
      <View style={{ width: 1200, height: 90, alignSelf: "center", marginTop: 60, borderTopWidth: 3, borderColor: cyan }}>
        {Array.from({ length: 25 }, (_, i) => <Arrive key={i} delay={i * 25} clock="step" fromY={-30}
          style={{ position: "absolute", left: i * 50, top: 0 }}><View style={{ width: 2, height: i % 5 === 0 ? 34 : 17, backgroundColor: cyan }} /></Arrive>)}
      </View>
    </SceneMotionView>
  </View>;
}

export function QuestionBlockers() {
  const revealed = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 650, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: revealed ? -220 : 0, scaleX: revealed ? 0.75 : 1, scaleY: revealed ? 0.75 : 1 }} duration={850}>
      <MovingTitle><Text style={titleStyle}>Why isn’t everyone doing this?</Text></MovingTitle>
    </SceneMotionView>
    {revealed && <View style={{ position: "absolute", top: 290, flexDirection: "row", gap: 56 }}>
      {["Performance", "Library support", "Desktop foundations"].map((label, i) => <SharedElement key={label} id={`objection-label-${i}`} resize="preserve">
        <Arrive delay={i * 180} clock="step" fromY={110}><View style={{ width: 528, height: 270, borderRadius: 36, borderWidth: 2, borderColor: cyan,
          backgroundColor: "#0b2536", justifyContent: "center", padding: 24 }}><Text style={{ ...titleStyle, fontSize: 42, lineHeight: 54 }}>{label}</Text></View></Arrive>
      </SharedElement>)}
    </View>}
  </View>;
}
