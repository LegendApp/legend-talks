import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { useState } from "react";
import { Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

const textStyle = { color: "#f8fafc", fontSize: 72, lineHeight: 96, fontWeight: "600" as const };
const gap = 20;

/** Measure native glyph widths once; step changes only set UI-thread motion targets. */
export function CompromiseQuestion() {
  const question = usePresentationValue("stepIndex") >= 1;
  const [nativeWidth, setNativeWidth] = useState(440);
  const [isWidth, setIsWidth] = useState(52);
  return <MovingTitle style={{ alignSelf: "center" }}>
    <SceneMotionView pose={{ x: question ? -18 : 0 }} duration={800}>
      <View accessibilityRole="header" accessibilityLabel={question ? "Is React Native a Compromise?" : "React Native is a Compromise"}
        style={{ flexDirection: "row", alignItems: "center", gap }}>
        <SceneMotionView pose={{ x: question ? isWidth + gap : 0 }} duration={800}>
          <Text style={textStyle} onLayout={event => setNativeWidth(event.nativeEvent.layout.width)}>React Native</Text>
        </SceneMotionView>
        <SceneMotionView pose={{ x: question ? -nativeWidth - gap : 0 }} duration={800}>
          <View onLayout={event => setIsWidth(event.nativeEvent.layout.width)}>
            <SceneMotionView pose={{ opacity: question ? 0 : 1 }} duration={450}>
              <Text style={textStyle}>is</Text>
            </SceneMotionView>
            <SceneMotionView pose={{ opacity: question ? 1 : 0 }} duration={450} style={{ position: "absolute", top: 0, left: 0 }}>
              <Text style={textStyle}>Is</Text>
            </SceneMotionView>
          </View>
        </SceneMotionView>
        <View>
          <Text style={textStyle}>a Compromise</Text>
          <SceneMotionView pose={{ opacity: question ? 1 : 0 }} duration={800} style={{ position: "absolute", left: "100%", top: 0 }}>
            <Text style={textStyle}>?</Text>
          </SceneMotionView>
        </View>
      </View>
    </SceneMotionView>
  </MovingTitle>;
}
