import { PlaybackKeyframeView, SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { useState, type ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";
import { MovingTitle } from "../MovingTitle";

const textStyle = { fontFamily: "System", color: "#f8fafc", fontSize: 72, lineHeight: 96, fontWeight: "600" as const };
const letterStyle = { ...textStyle, textAlign: "center" as const };
const gap = textStyle.fontSize * 0.28;

function TitlePhrase({ children, onLayout }: { children: string; onLayout?: ViewProps["onLayout"] }) {
  return <View onLayout={onLayout} style={{ flexDirection: "row", gap }}>
    {children.split(" ").map((word, index) => <View key={index} style={{ flexDirection: "row" }}>
      {Array.from(word).map((letter, index) => <Text key={index} style={letterStyle}>{letter}</Text>)}
    </View>)}
  </View>;
}

/** Measure native glyph widths once; step changes only set UI-thread motion targets. */
export function CompromiseQuestion({ title }: { title?: ReactNode }) {
  const question = usePresentationValue("stepIndex") >= 1;
  const [nativeWidth, setNativeWidth] = useState(440);
  const [isWidth, setIsWidth] = useState(52);
  return <MovingTitle style={{ alignSelf: "center", ...(title ? { width: 1696 } : {}) }}>
    {title && <View accessibilityElementsHidden={question} importantForAccessibility={question ? "no-hide-descendants" : "auto"}
      style={{ position: "absolute", top: 0, width: 1696, opacity: question ? 0 : 1 }}>{title}</View>}
    <SceneMotionView pose={{ x: question ? -18 : 0 }} duration={800}>
      <View accessibilityRole="header" accessibilityLabel={question ? "Is React Native a Compromise?" : "React Native is a Compromise"}
        accessibilityElementsHidden={!!title && !question} importantForAccessibility={title && !question ? "no-hide-descendants" : "auto"}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap, opacity: title && !question ? 0 : 1 }}>
        <SceneMotionView pose={{ x: question ? isWidth + gap : 0 }} duration={800}>
          <TitlePhrase onLayout={event => setNativeWidth(event.nativeEvent.layout.width)}>React Native</TitlePhrase>
        </SceneMotionView>
        <SceneMotionView pose={{ x: question ? -nativeWidth - gap : 0 }} duration={800}>
          <View onLayout={event => setIsWidth(event.nativeEvent.layout.width)}>
            <SceneMotionView pose={{ opacity: question ? 0 : 1 }} delay={320} duration={320}>
              <TitlePhrase>is</TitlePhrase>
            </SceneMotionView>
            <SceneMotionView pose={{ opacity: question ? 1 : 0 }} delay={320} duration={320} style={{ position: "absolute", top: 0, left: 0, width: 120 }}>
              {/* Independent overlay width avoids clipping the wider capital I without adding row spacing. */}
              <Text style={textStyle}>Is</Text>
            </SceneMotionView>
          </View>
        </SceneMotionView>
        <View>
          <TitlePhrase>a Compromise</TitlePhrase>
          <SceneMotionView pose={{ opacity: question ? 1 : 0 }} delay={320} duration={320} style={{ position: "absolute", left: "100%", top: 0 }}>
            <PlaybackKeyframeView previewTime={2} keyframes={[
              { time: 0, x: 0, y: 25, opacity: 0 }, { time: 420, x: 0, y: 25, opacity: 0 },
              { time: 660, x: 0, y: -10, opacity: 1 }, { time: 860, x: 0, y: 0, opacity: 1 },
            ]}><Text style={textStyle}>?</Text></PlaybackKeyframeView>
          </SceneMotionView>
        </View>
      </View>
    </SceneMotionView>
  </MovingTitle>;
}
