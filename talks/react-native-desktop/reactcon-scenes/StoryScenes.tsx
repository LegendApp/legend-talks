import { SceneMotionView, ScenePositionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "../MovingTitle";
import { Arrive } from "./Motion";
import { DesktopObjections } from "../ObjectionsReactcon";

const ink = "#f8fafc", cyan = "#67e8f9";
const titleStyle = { color: ink, fontSize: 80, lineHeight: 104, fontWeight: "600" as const, textAlign: "center" as const };
const questionTitleStyle = { color: ink, fontFamily: "Helvetica Neue", fontSize: 72, lineHeight: 90,
  fontWeight: "600" as const, letterSpacing: -1.8, textAlign: "center" as const };

export function Measured() {
  return <View style={{ width: 1696, height: 520, justifyContent: "center" }}>
    <SceneMotionView initialPose={{ y: 60, opacity: 0 }} pose={{ y: 0, opacity: 1 }} duration={650}>
      <MovingTitle><Text style={titleStyle}>So I measured it</Text></MovingTitle>
      <View style={{ width: 1200, height: 90, alignSelf: "center", marginTop: 60, borderTopWidth: 3, borderColor: cyan }}>
        {Array.from({ length: 25 }, (_, i) => <Arrive key={i} delay={i * 25} clock="step" fromY={-30}
          style={{ position: "absolute", left: i * 50, top: 0 }}><View style={{ width: 2, height: i % 5 === 0 ? 34 : 17, backgroundColor: cyan }} /></Arrive>)}
      </View>
    </SceneMotionView>
  </View>;
}

export function QuestionBlockers() {
  const step = usePresentationValue("stepIndex");
  const revealed = step >= 1;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <ScenePositionView y={revealed ? 20 : (850 - 90) / 2} duration={850} style={{ width: 1696, height: 90 }}>
      <MovingTitle style={{ width: 1696, height: 90 }}>
        <SceneMotionView hidden={revealed} pose={{ opacity: revealed ? 0 : 1 }} duration={850}>
          <Text style={questionTitleStyle}>Why isn’t everyone doing this?</Text>
        </SceneMotionView>
        <SceneMotionView hidden={!revealed} pose={{ opacity: revealed ? 1 : 0 }} duration={850}
          style={{ position: "absolute", width: 1696 }}>
          <Text style={questionTitleStyle}>What’s holding desktop back</Text>
        </SceneMotionView>
      </MovingTitle>
    </ScenePositionView>
    <View style={{ position: "absolute", top: 140, width: 1696 }}>
      <DesktopObjections introduction />
    </View>
  </View>;
}
