import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { Chart } from "./BenchmarkChart";
import { HelloWorldTitle } from "./HelloWorldTitle";

export function HelloWorldIntro() {
  const showChart = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 860, alignSelf: "center" }}>
    <SceneMotionView pose={{ y: showChart ? 0 : 320 }} duration={650}>
      <HelloWorldTitle metric={showChart ? "first content" : undefined} animateEntrance />
    </SceneMotionView>
    {showChart && <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: 1 }} duration={650}>
      <Chart workload="hello" metric="content" groupAtStep={2} />
    </SceneMotionView>}
  </View>;
}
