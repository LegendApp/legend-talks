import { NativeVideoView } from "@legend-apps/presentation";
import { useState } from "react";
import { Image } from "react-native";

// Existing recording pages and their MP4s share a basename. Keep the local
// asset URL stable across steps so zooms do not recreate or restart the player.
export function LocalRecording({ page, poster, playing, extension = "mp4" }: {
  page: string; poster: string; playing: boolean; transparent?: boolean; extension?: "mp4" | "mov";
}) {
  const [started, setStarted] = useState(playing);
  if (playing && !started) setStarted(true);
  if (!started) return <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />;
  return <NativeVideoView source={page.replace(/\.html$/, `.${extension}`)} poster={poster} playing={playing} />;
}
