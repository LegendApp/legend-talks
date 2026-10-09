import { PosterVideo } from "slides:media/PosterVideo";
import type { SharedValue } from "react-native-reanimated";

export function LocalRecording({ page, extension = "mp4", ...props }: {
  page: string; poster: string; playing: boolean; transparent?: boolean; extension?: "mp4" | "mov"; looping?: boolean; position?: SharedValue<number>;
}) {
  return <PosterVideo {...props} source={page.replace(/\.html$/, `.${extension}`)} />;
}
