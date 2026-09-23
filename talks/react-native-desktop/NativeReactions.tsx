import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";
// @ts-ignore Deck-local asset URL.
import nativeCocoa from "./rnconnection-assets/native-reactions/native-cocoa.png";
// @ts-ignore Deck-local asset URL.
import rnFan from "./rnconnection-assets/native-reactions/rn-fan.png";

// @ts-ignore Deck-local asset URL.
import mutuallyExclusive from "./rnconnection-assets/native-reactions/mutually-exclusive.png";
// @ts-ignore Deck-local asset URL.
import lowMemory from "./rnconnection-assets/native-reactions/low-memory.png";
// @ts-ignore Deck-local asset URL.
import appkit from "./rnconnection-assets/native-reactions/appkit.png";
// @ts-ignore Deck-local asset URL.
import bareMetal from "./rnconnection-assets/native-reactions/bare-metal.png";

const letters = Array.from("“Native would be faster”");
const reactions = [nativeCocoa, mutuallyExclusive, appkit, bareMetal, lowMemory, rnFan].map((uri, index) => ({
  uri, left: index % 2 === 0 ? 0 : 868, top: 35 + Math.floor(index / 2) * 255, height: 225,
}));

export function NativeReactions() {
  const revealed = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    {reactions.map((reaction, index) => <SceneMotionView key={reaction.uri}
      pose={{ opacity: revealed ? 1 : 0, scaleX: revealed ? 1 : 0.92, scaleY: revealed ? 1 : 0.92 }}
      duration={950 + index * 100}
      style={{ position: "absolute", left: reaction.left, top: reaction.top, width: 828, height: reaction.height }}>
      <Image source={{ uri: reaction.uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
    </SceneMotionView>)}
    <MovingTitle style={{ position: "absolute", top: 340, left: 0, width: 1696 }}>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {letters.map((letter, index) => <SceneMotionView key={index}
          pose={{ x: revealed ? (index - (letters.length - 1) / 2) * 18 : 0,
            y: revealed ? (index % 3 - 1) * 255 : 0,
            scaleX: revealed ? 0.5 : 1, scaleY: revealed ? 0.5 : 1, opacity: revealed ? 0 : 1 }}
          duration={700 + index * 14}>
          <Text style={{ fontSize: 72, lineHeight: 92, fontWeight: "600", color: "#fff" }}>{letter === " " ? "\u00a0" : letter}</Text>
        </SceneMotionView>)}
      </View>
    </MovingTitle>
  </View>;
}
