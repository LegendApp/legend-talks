import { NativeVideoView } from "@legend-apps/presentation";

// Existing recording pages and their MP4s share a basename. Keep the local
// asset URL stable across steps so zooms do not recreate or restart the player.
export function LocalRecording({ page, poster, playing, extension = "mp4" }: {
  page: string; poster: string; playing: boolean; transparent?: boolean; extension?: "mp4" | "mov";
}) {
  return <NativeVideoView source={page.replace(/\.html$/, `.${extension}`)} poster={poster} playing={playing} />;
}
