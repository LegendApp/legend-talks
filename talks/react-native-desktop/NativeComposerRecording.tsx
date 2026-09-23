import { usePresentationValue } from "@legend-apps/presentation";
import { Image, View } from "react-native";
import { LocalRecording } from "./LocalRecording";
// @ts-ignore Local deck media resolves to file URLs.
import page from "./rnconnection-assets/framework-recordings/react-native.html";
// @ts-ignore Local deck media resolves to file URLs.
import poster from "./rnconnection-assets/framework-recordings/react-native.png";

// Match the React Native composer bounds used by the nine-app tour. Keep a
// little surrounding content above it so scrolling demonstrates the glass.
const videoWidth = 1180 / 0.75;
const videoHeight = videoWidth * 9 / 16;
const composerCenterX = 0.265 + 0.675 / 2;

export function NativeComposerRecording() {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  return <View style={{ width: 1180, height: 560, overflow: "hidden", borderRadius: 18,
    borderWidth: 1, borderColor: "#88bed688", backgroundColor: "#101e30" }}>
    <View style={{ position: "absolute", width: videoWidth, height: videoHeight,
      left: 590 - composerCenterX * videoWidth, top: 560 - videoHeight }}>
      {isPreview ? <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
        : <LocalRecording page={page} poster={poster} playing={step === 2 && phase === "playing"} />}
    </View>
  </View>;
}
