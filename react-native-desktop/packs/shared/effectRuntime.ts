import { samplePlayback, usePlayback } from "@legend-apps/presentation";
import { useDerivedValue } from "react-native-reanimated";
export function clamp01(value: number) { "worklet"; return Math.max(0, Math.min(1, value)); }
export function smooth(value: number) { "worklet"; const clamped = clamp01(value); return clamped * clamped * (3 - 2 * clamped); }
export function stage(time: number, start: number, duration: number) { "worklet"; return smooth((time - start) / duration); }
export function useEffectTime(previewTime: number) {
  const playback = usePlayback();
  return useDerivedValue(() => samplePlayback(playback.value, previewTime, "slide"), [previewTime]);
}
export const useEffectTime$ = useEffectTime;
