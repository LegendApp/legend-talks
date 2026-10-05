import { PlaybackKeyframeView, SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
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

const letters = Array.from("“Native would be faster”");
const widths = letters.map(letter => /[ ilft“”]/.test(letter) ? 23 : /[mw]/.test(letter) ? 57 : 40);
const textLeft = (1696 - widths.reduce((sum, width) => sum + width, 0)) / 2;
const letterX = (index: number) => textLeft + widths.slice(0, index).reduce((sum, width) => sum + width, 0) + widths[index] / 2;
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
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    {reactions.map((reaction, reactionIndex) => <SceneMotionView key={reaction.uri}
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
    <MovingTitle style={{ position: "absolute", top: 340, left: 0, width: 1696, height: 92 }}>
      {letters.map((letter, index) => {
        const target = reactions.reduce((nearest, reaction) => Math.abs(reaction.anchor - index) < Math.abs(nearest.anchor - index) ? reaction : nearest);
        const text = <Text style={{ fontSize: 72, lineHeight: 92, fontWeight: "600", color: "#fff", textAlign: "center" }}>{letter === " " ? "\u00a0" : letter}</Text>;
        return <SceneMotionView key={index}
          pose={{ x: revealed ? target.x - letterX(index) : 0, y: revealed ? target.y - titleY : 0,
            scaleX: revealed ? 3.8 : 1, scaleY: revealed ? 3.8 : 1 }}
          duration={1100} delay={reactions.indexOf(target) * 85}
          style={{ position: "absolute", left: letterX(index) - widths[index] / 2, width: widths[index], height: 92 }}>
          {revealed ? <PlaybackKeyframeView keyframes={letterFade}>{text}</PlaybackKeyframeView> : text}
        </SceneMotionView>;
      })}
    </MovingTitle>
  </View>;
}
