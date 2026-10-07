import { useNativeVideo } from "@legend-apps/presentation";
import type { SkImage } from "@shopify/react-native-skia";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";

const FrameContext = createContext<SharedValue<SkImage | null> | null>(null);

/** Share one player between the card and its takeover without publishing readiness to their parent. */
export function RecordingFrameProvider({ children, source, playing, isPreview }: {
  children: ReactNode; source: string; playing: boolean; isPreview: boolean;
}) {
  const [started, setStarted] = useState(playing);
  if (playing && !started) setStarted(true);
  const video = useNativeVideo(!isPreview && started ? source : null, playing);
  return <FrameContext.Provider value={video.currentFrame}>{children}</FrameContext.Provider>;
}

export function useRecordingFrame() {
  const frame = useContext(FrameContext);
  if (!frame) throw new Error("Recording frame requires its provider.");
  return frame;
}
