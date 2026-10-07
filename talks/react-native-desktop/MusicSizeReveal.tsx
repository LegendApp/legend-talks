import { useMemo } from "react";
import { View } from "react-native";
import { Canvas, matchFont } from "@shopify/react-native-skia";
import { SkiaNumberFlow } from "number-flow-react-native/skia";
import { ProgressivePreparation, usePlayback, usePresentationValue } from "@legend-apps/presentation";
import { Easing } from "react-native-reanimated";
import { BenchmarkRow, chartLayout } from "./BenchmarkChart";
import { numberFlowTiming } from "./numberFlowTiming";

const format = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
const easing = Easing.out(Easing.cubic);

export function MusicSizeReveal() {
  const step = usePresentationValue("stepIndex");
  const playback = usePlayback();
  const font = useMemo(() => matchFont({ fontFamily: "Helvetica Neue", fontSize: chartLayout.fontSize, fontWeight: "600" }), []);
  const timing = useMemo(() => ({ duration: 1100, easing, animation: numberFlowTiming(playback) }), [playback]);
  const installed = step === 0 ? 35.3 : 15.4;
  const number = <View accessible accessibilityLabel={`${installed.toFixed(1)} MB`}>
    <Canvas style={{ width: chartLayout.valueWidth, height: chartLayout.rowHeight }} accessible={false}>
      <SkiaNumberFlow value={installed} font={font} format={format} locales="en-US" color="#f1f5f9"
        suffix=" MB" width={chartLayout.valueWidth} y={32} textAlign="right" tabularNums
        spinTiming={timing} transformTiming={timing} opacityTiming={timing} />
    </Canvas>
  </View>;
  return <View style={{ width: chartLayout.width,
    height: chartLayout.top * 2 + chartLayout.rowSpacing + chartLayout.rowHeight,
    marginTop: chartLayout.marginTop, alignSelf: "center" }}>
    <ProgressivePreparation>{[
    <BenchmarkRow key="music" name="Legend Music" value={installed} maximum={430} valueContent={number}
      highlighted animateValue duration={1100} y={chartLayout.top} />,
    <BenchmarkRow key="spotify" name="Spotify" value={430} maximum={430} valueLabel="430.0 MB"
      y={chartLayout.top + chartLayout.rowSpacing} />
    ]}</ProgressivePreparation>
  </View>;
}
