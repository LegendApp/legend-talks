import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "../MovingTitle";
import { Arrive } from "./Motion";
import { DesktopObjections } from "../ObjectionsReactcon";
import type { ReactNode } from "react";

const ink = "#f8fafc", cyan = "#67e8f9";
const titleStyle = { color: ink, fontSize: 80, lineHeight: 104, fontWeight: "600" as const, textAlign: "center" as const };

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

export function QuestionBlockers({ title }: { title?: ReactNode }) {
  const step = usePresentationValue("stepIndex");
  const revealed = step >= 1;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <MovingTitle style={{ position: "absolute", top: 20, width: 1696, height: 104 }}>
      <SceneMotionView
        pose={{ y: revealed ? 0 : 280, scaleX: revealed ? 0.9 : 1, scaleY: revealed ? 0.9 : 1 }}
        duration={850} style={{ position: "absolute", width: 1696 }}>
        <SceneMotionView hidden={revealed} pose={{ opacity: revealed ? 0 : 1 }} duration={850}>
          {title ?? <Text style={titleStyle}>Why isn’t everyone doing this?</Text>}
        </SceneMotionView>
        <SceneMotionView hidden={!revealed} pose={{ opacity: revealed ? 1 : 0 }} duration={850}
          style={{ position: "absolute", width: 1696 }}>
          <Text style={titleStyle}>What’s holding desktop back</Text>
        </SceneMotionView>
      </SceneMotionView>
    </MovingTitle>
    <View style={{ position: "absolute", top: 140, width: 1696 }}>
      <DesktopObjections introduction />
    </View>
  </View>;
}
