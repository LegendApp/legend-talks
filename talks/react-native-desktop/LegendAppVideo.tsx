import { NativeVideoView, usePresentationValue } from "@legend-apps/presentation";
import { Image, View } from "react-native";
// @ts-ignore Local deck assets resolve to file URLs.
import poster from "./rnconnection-assets/together.png";

export function LegendAppVideo() {
  const isActive = usePresentationValue("isActive");
  const isPreview = usePresentationValue("isPreview");
  const phase = usePresentationValue("playbackPhase");
  return <View accessibilityLabel="Legend app demonstration" style={{ width: 740 * 1420 / 946, height: 740, alignSelf: "center" }}>
    {isPreview ? <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
      : <NativeVideoView source={poster.replace(/\.png$/, ".mp4")} poster={poster} playing={isActive && phase === "playing"} />}
  </View>;
}
