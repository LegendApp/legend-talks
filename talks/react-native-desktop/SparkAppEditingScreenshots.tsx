import { SceneMotionView, samplePlayback, usePlayback, usePresentationValue } from "@legend-apps/presentation";
import { Canvas, Circle, Group, Path, Rect, RoundedRect, Text as SkiaText, matchFont } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Image, View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { sampleSparkEdit, sparkEditDuration, sparkEditPrompt } from "./sparkEditingTimeline";

const sampleClock = samplePlayback;
const sampleFrame = sampleSparkEdit;
const scale = 710 / 1280;
const width = 1640 * scale;
const zoom = 2.1;
const focusedX = -(1008 - 820) * scale * zoom;
const focusedY = -(493 - 640) * scale * zoom;

export function SparkAppEditingScreenshots({ before, after }: { before: string; after: string }) {
  const focused = usePresentationValue("stepIndex") >= 1;
  const playback = usePlayback();
  const elapsed = useDerivedValue(() => focused ? sampleClock(playback.value, sparkEditDuration, "step") : 0, [focused]);
  const frame = useDerivedValue(() => sampleFrame(elapsed.value));
  const font = useMemo(() => matchFont({ fontFamily: "Helvetica Neue", fontSize: 28, fontWeight: "500" }), []);
  const buttonFont = useMemo(() => matchFont({ fontFamily: "Helvetica Neue", fontSize: 28, fontWeight: "600" }), []);
  const advances = useMemo(() => {
    return Array.from({ length: sparkEditPrompt.length + 1 }, (_, index) => font.measureText(sparkEditPrompt.slice(0, index)).width);
  }, [font]);
  const resultStyle = useAnimatedStyle(() => ({ opacity: frame.value.result }));
  const typed = useDerivedValue(() => frame.value.text);
  const inputOpacity = useDerivedValue(() => frame.value.input);
  const caretOpacity = useDerivedValue(() => frame.value.caret);
  const caretX = useDerivedValue(() => 502 + advances[frame.value.characters], [advances]);
  const buttonText = useDerivedValue(() => frame.value.generating ? "Generating…" : "Generate & Preview");
  const buttonX = useDerivedValue(() => frame.value.generating ? 532 : 500);
  const spinnerOpacity = useDerivedValue(() => frame.value.generating ? 1 : 0);
  const spinnerTransform = useDerivedValue(() => [{ translateX: 506 }, { translateY: 752 }, { rotate: frame.value.spin }]);
  return <View style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 24, overflow: "hidden" }}>
    <SceneMotionView initialPose={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
      pose={{ x: focused ? focusedX : 0, y: focused ? focusedY : 0, scaleX: focused ? zoom : 1, scaleY: focused ? zoom : 1 }}
      duration={850} style={{ position: "absolute", left: (1696 - width) / 2, width, height: 710 }}>
      <Image source={{ uri: before }} style={{ width, height: 710 }} resizeMode="contain"
        accessibilityLabel="Legend Diff Customize App before editing, with gray appearance text and an empty prompt" />
      <Animated.Image source={{ uri: after }} style={[{ position: "absolute", width, height: 710 }, resultStyle]}
        resizeMode="contain" accessibilityLabel="Legend Diff Customize App after changing the appearance text to teal" />
      <Canvas pointerEvents="none" accessible={false} style={{ position: "absolute", width, height: 710 }}>
        <Group transform={[{ scale }]} opacity={inputOpacity}>
          <RoundedRect x={478} y={508} width={1060} height={184} r={10} color="#232425" />
          <RoundedRect x={473} y={503} width={1071} height={195} r={12} color="#267aa5" style="stroke" strokeWidth={3} />
          <Group clip={{ x: 495, y: 524, width: 1025, height: 145 }}>
            <SkiaText text={typed} font={font} x={502} y={564} color="#f2f2f2" />
            <Rect x={caretX} y={540} width={2} height={30} color="#f2f2f2" opacity={caretOpacity} />
          </Group>
          <RoundedRect x={475} y={721} width={307} height={63} r={11} color="#292a2b" />
          <RoundedRect x={475} y={721} width={307} height={63} r={11} color="#444547" style="stroke" strokeWidth={1.5} />
          <SkiaText text={buttonText} font={buttonFont} x={buttonX} y={763} color="#f2f2f2" />
          <Group transform={spinnerTransform} opacity={spinnerOpacity}>
            <Circle cx={0} cy={0} r={10} color="#ffffff35" style="stroke" strokeWidth={2.5} />
            <Path path="M 0 -10 A 10 10 0 1 1 -10 0" color="white" style="stroke" strokeWidth={2.5} strokeCap="round" />
          </Group>
        </Group>
      </Canvas>
    </SceneMotionView>
  </View>;
}
