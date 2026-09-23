import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Image, View } from "react-native";
import { LocalRecording } from "./LocalRecording";
// @ts-ignore Local deck media resolves to file URLs.
import page from "./rnconnection-assets/app-recordings/music.html";
// @ts-ignore Local deck media resolves to file URLs.
import poster from "./rnconnection-assets/app-recordings/music.png";

// overlay2.mov is already bundled as music.mov. Preserve its full 1768×1362
// frame initially, then bring the playback controls at the top into focus.
const videoHeight = 560;
const videoWidth = videoHeight * 1768 / 1362;

export function NativeMusicRecording() {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  return <View style={{ width: 1180, height: 560, overflow: "hidden", borderRadius: 18,
    borderWidth: 1, borderColor: "#88bed688", backgroundColor: "#101e30" }}>
    <SceneMotionView pose={{ scaleX: step === 2 ? 3 : 1, scaleY: step === 2 ? 3 : 1, y: step === 2 ? 260 : 0 }}
      duration={5500} style={{ position: "absolute", width: videoWidth, height: videoHeight,
      left: (1180 - videoWidth) / 2, top: 0 }}>
      {isPreview ? <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
        : <LocalRecording page={page} poster={poster} playing={step === 2 && phase === "playing"} />}
    </SceneMotionView>
  </View>;
}
