import { snapshotCaptureQueue } from "@legend-apps/presentation";
import { Blur, Canvas, Group, Image as SkiaImage, Paint, makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import { useDeferredValue, useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue, type SharedValue } from "react-native-reanimated";

/** Capture on layout changes only; blur and the live-content handoff run on the UI thread. */
export function CarouselBlurView({ children, progress, index, enabled }: {
  children: ReactNode; progress: SharedValue<{ position: number }>; index: number; enabled: boolean;
}) {
  const snapshotEnabled = useDeferredValue(enabled, false);
  const source = useRef<View>(null);
  const layout = useRef({ width: 0, height: 0 });
  const size = useSharedValue({ width: 0, height: 0 });
  const image = useSharedValue<SkImage | null>(null);
  const recapture = useRef(() => {});
  useEffect(() => {
    let release = () => {};
    const capture = () => {
      const previousRelease = release;
      release = () => {};
      previousRelease();
      image.set(null);
      if (!enabled || !snapshotEnabled || !layout.current.width || !layout.current.height) return;
      let cancelled = false;
      let captured: SkImage | undefined;
      const cancelCapture = snapshotCaptureQueue.enqueue(async () => {
        try {
          const snapshot = await makeImageFromView(source);
          if (!snapshot) return;
          if (cancelled) { snapshot.dispose(); return; }
          captured = snapshot;
          image.set(snapshot);
        } catch { /* Keep live content if native capture is unavailable. */ }
      });
      release = () => {
        cancelled = true;
        cancelCapture();
        const previous = captured;
        captured = undefined;
        runOnUI(() => { "worklet"; image.set(null); previous?.dispose(); })();
      };
    };
    recapture.current = capture;
    capture();
    return () => { recapture.current = () => {}; release(); };
  }, [enabled, snapshotEnabled, image]);
  const focus = useDerivedValue(() => {
    "worklet";
    const distance = enabled ? Math.min(1, Math.abs(index - progress.value.position)) : 0;
    return distance * distance * (3 - 2 * distance);
  }, [enabled, index]);
  const blur = useDerivedValue(() => { "worklet"; return 10 * focus.value; });
  const width = useDerivedValue(() => { "worklet"; return size.value.width; });
  const height = useDerivedValue(() => { "worklet"; return size.value.height; });
  const liveStyle = useAnimatedStyle(() => { "worklet"; return { opacity: image.value ? 1 - focus.value : 1 }; });
  const snapshotStyle = useAnimatedStyle(() => { "worklet"; return { opacity: image.value ? focus.value : 0 }; });
  return <View style={styles.fill} onLayout={event => {
    const { width, height } = event.nativeEvent.layout;
    if (layout.current.width === width && layout.current.height === height) return;
    layout.current = { width, height };
    size.set(layout.current);
    recapture.current();
  }}>
    <Animated.View style={[styles.fill, liveStyle]}>
      <View ref={source} collapsable={false} style={styles.fill}>{children}</View>
    </Animated.View>
    {enabled && snapshotEnabled && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, snapshotStyle]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group layer={<Paint><Blur blur={blur} mode="clamp" /></Paint>}>
          <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="fill" />
        </Group>
      </Canvas>
    </Animated.View>}
  </View>;
}
const styles = StyleSheet.create({ fill: { flex: 1 } });
