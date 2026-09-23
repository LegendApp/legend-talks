import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { Chart } from "./BenchmarkChart";
import { MovingTitle } from "./MovingTitle";

export function HelloWorldIntro() {
  const showChart = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <SceneMotionView pose={{ y: showChart ? 0 : 320 }} duration={650}>
      <MovingTitle><Text style={{ color: "#fff", fontSize: 72, lineHeight: 92, fontWeight: "600", textAlign: "center" }}>
        {showChart ? "Hello World · first content" : "Hello World"}
      </Text></MovingTitle>
    </SceneMotionView>
    {showChart && <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: 1 }} duration={650}>
      <Chart workload="hello" metric="content" groupAtStep={2} />
    </SceneMotionView>}
  </View>;
}
