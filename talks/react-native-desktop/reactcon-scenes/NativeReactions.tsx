import { PlaybackKeyframeView, SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { MovingTitle } from "../MovingTitle";
// @ts-ignore Deck-local asset URL.
import nativeCocoa from "../rnconnection-assets/native-reactions/native-cocoa.png";
// @ts-ignore Deck-local asset URL.
import rnFan from "../rnconnection-assets/native-reactions/rn-fan.png";

// @ts-ignore Deck-local asset URL.
import mutuallyExclusive from "../rnconnection-assets/native-reactions/mutually-exclusive.png";
// @ts-ignore Deck-local asset URL.
import lowMemory from "../rnconnection-assets/native-reactions/low-memory.png";
// @ts-ignore Deck-local asset URL.
import appkit from "../rnconnection-assets/native-reactions/appkit.png";
// @ts-ignore Deck-local asset URL.
import bareMetal from "../rnconnection-assets/native-reactions/bare-metal.png";

const title = "“Native would be faster”";
const letters = Array.from(title.replaceAll(" ", "\u00a0"));
const titleTextStyle = { fontSize: 72, lineHeight: 92, fontWeight: "600", color: "#fff" } as const;
type TitleMetrics = { widths: number[]; ends: number[] };
const titleY = 386;
const reactions = [
  { uri: nativeCocoa, x: 390, y: 125, rotation: "-4deg", anchor: 2, height: 242 },
  { uri: mutuallyExclusive, x: 1306, y: 145, rotation: "4deg", anchor: 6, height: 209 },
  { uri: appkit, x: 370, y: 427, rotation: "3deg", anchor: 10, height: 215 },
  { uri: bareMetal, x: 1320, y: 455, rotation: "-3deg", anchor: 14, height: 237 },
  { uri: lowMemory, x: 390, y: 735, rotation: "-4deg", anchor: 18, height: 215 },
  { uri: rnFan, x: 1300, y: 755, rotation: "3deg", anchor: 21, height: 209 },
];
const letterFade = [{ time: 0, x: 0, y: 0, opacity: 1 }, { time: 200, x: 0, y: 0, opacity: 1 }, { time: 800, x: 0, y: 0, opacity: 0 }];
const cardFade = [{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 100, x: 0, y: 0, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];

export function NativeReactions() {
  const revealed = usePresentationValue("stepIndex") > 0;
  const pendingMetrics = useRef<TitleMetrics>({ widths: letters.map(() => NaN), ends: letters.map(() => NaN) });
  const [metrics, setMetrics] = useState<TitleMetrics | null>(null);
  const measure = (kind: keyof TitleMetrics, index: number, width: number) => {
    const pending = pendingMetrics.current;
    if (pending[kind][index] === width) return;
    pending[kind][index] = width;
    if (pending.widths.every(Number.isFinite) && pending.ends.every(Number.isFinite)) {
      setMetrics({ widths: [...pending.widths], ends: [...pending.ends] });
    }
  };
  const textLeft = metrics ? (1696 - metrics.ends[letters.length - 1]) / 2 : 0;
  const letterX = (index: number) => textLeft + metrics!.ends[index] - metrics!.widths[index] / 2;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", width: 1696, height: 92, opacity: 0 }}>
      {letters.map((letter, index) => <View key={index}>
        <Text style={[titleTextStyle, { position: "absolute", width: 1696 }]}
          onTextLayout={event => measure("widths", index, event.nativeEvent.lines[0].width)}>{letter}</Text>
        <Text style={[titleTextStyle, { position: "absolute", width: 1696 }]}
          onTextLayout={event => measure("ends", index, event.nativeEvent.lines[0].width)}>{letters.slice(0, index + 1).join("")}</Text>
      </View>)}
    </View>
    <MovingTitle style={{ position: "absolute", top: 340, left: 0, width: 1696, height: 92 }}>
      <Text style={[titleTextStyle, { textAlign: "center", opacity: revealed && metrics ? 0 : 1 }]}>{title}</Text>
      {metrics && letters.map((letter, index) => {
        const target = reactions.reduce((nearest, reaction) => Math.abs(reaction.anchor - index) < Math.abs(nearest.anchor - index) ? reaction : nearest);
        const text = <Text style={[titleTextStyle, { textAlign: "center" }]}>{letter}</Text>;
        return <SceneMotionView key={index}
          initialPose={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
          pose={{ x: revealed ? target.x - letterX(index) : 0, y: revealed ? target.y - titleY : 0,
            scaleX: revealed ? 3.8 : 1, scaleY: revealed ? 3.8 : 1 }}
          duration={1100} delay={reactions.indexOf(target) * 85}
          style={{ position: "absolute", left: letterX(index) - metrics.widths[index] / 2 - 1, width: metrics.widths[index] + 2, height: 92 }}>
          {revealed && <PlaybackKeyframeView keyframes={letterFade} delay={reactions.indexOf(target) * 85}>{text}</PlaybackKeyframeView>}
        </SceneMotionView>;
      })}
    </MovingTitle>
    {metrics && reactions.map((reaction, reactionIndex) => <SceneMotionView key={reaction.uri}
      initialPose={{ x: 0, y: 0, scaleX: 0.025, scaleY: 0.025, opacity: 0 }}
      pose={{ x: revealed ? reaction.x - letterX(reaction.anchor) : 0, y: revealed ? reaction.y - titleY : 0,
        scaleX: revealed ? 1 : 0.025, scaleY: revealed ? 1 : 0.025, opacity: revealed ? 1 : 0 }}
      duration={1100} delay={reactionIndex * 85}
      style={{ position: "absolute", left: letterX(reaction.anchor) - 440, top: titleY - reaction.height / 2,
        width: 880, height: reaction.height }}>
      {revealed && <PlaybackKeyframeView keyframes={cardFade} style={{ flex: 1 }}>
        <View style={{ flex: 1, transform: [{ rotate: reaction.rotation }], borderRadius: 18,
          borderWidth: 1.5, borderColor: "#8bdcff", backgroundColor: "#06111d",
          shadowColor: "#39bfff", shadowOpacity: 0.8, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }}>
          <Image source={{ uri: reaction.uri }} resizeMode="contain" style={{ width: "100%", height: "100%", borderRadius: 17 }} />
        </View>
      </PlaybackKeyframeView>}
    </SceneMotionView>)}
  </View>;
}
