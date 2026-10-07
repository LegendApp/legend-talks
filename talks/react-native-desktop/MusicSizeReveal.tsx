import { useMemo } from "react";
import { View } from "react-native";
import { Canvas, matchFont } from "@shopify/react-native-skia";
import { SkiaNumberFlow } from "number-flow-react-native/skia";
import { usePlayback, usePresentationValue } from "@legend-apps/presentation";
import { Easing } from "react-native-reanimated";
import { MusicPerformance } from "./MusicPerformance";
import { numberFlowTiming } from "./numberFlowTiming";

const format = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
const easing = Easing.out(Easing.cubic);

export function MusicSizeReveal() {
  const step = usePresentationValue("stepIndex");
  const playback = usePlayback();
  const font = useMemo(() => matchFont({ fontFamily: "Helvetica Neue", fontSize: 100, fontWeight: "600" }), []);
  const timing = useMemo(() => ({ duration: 1100, easing, animation: numberFlowTiming(playback) }), [playback]);
  const installed = step === 0 ? 35.3 : 15.4;
  const zipped = step === 0 ? 11.4 : 6.3;
  const number = (value: number) => <View accessible accessibilityLabel={`${value.toFixed(0)} MB`}>
    <Canvas style={{ width: 500, height: 130 }} accessible={false}>
      <SkiaNumberFlow value={value} font={font} format={format} locales="en-US" color="white"
        suffix=" MB" width={500} y={98} textAlign="center" tabularNums
        spinTiming={timing} transformTiming={timing} opacityTiming={timing} />
    </Canvas>
  </View>;
  return <MusicPerformance metric="size" installedSize={number(installed)} zippedSize={number(zipped)} spotifyInstalledSize="430 MB" />;
}
