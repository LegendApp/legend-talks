import { usePresentationValue } from "@legend-apps/presentation";
import { Image, View } from "react-native";
import { LocalRecording } from "./LocalRecording";
// @ts-ignore Local deck media resolves to file URLs.
import page from "./rnconnection-assets/app-recordings/music.html";
// @ts-ignore Local deck media resolves to file URLs.
import poster from "./rnconnection-assets/app-recordings/music.png";

// Match the card to the full recording instead of cropping or zooming it.
const videoHeight = 670;
const videoWidth = videoHeight * 1768 / 1362;

export function NativeMusicRecording() {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  return <View style={{ width: videoWidth, height: videoHeight, alignSelf: "center", overflow: "hidden",
    borderRadius: 18, borderWidth: 1, borderColor: "#88bed688", backgroundColor: "#000000" }}>
    {isPreview ? <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
      : <LocalRecording page={page} poster={poster} extension="mov" playing={step === 2 && phase === "playing"} />}
  </View>;
}
