import { Canvas, DiffRect, Path, RoundedRect, rect, rrect } from "@shopify/react-native-skia";
import { usePresentationValue } from "@legend-apps/presentation";
import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { measure, runOnUI, useAnimatedRef, useAnimatedStyle, useDerivedValue, useFrameCallback, useSharedValue, type AnimatedRef, type SharedValue } from "react-native-reanimated";
import { calloutBounds, relativeBounds, type Bounds } from "./geometry";
import { FrameView } from "../shared/FrameView";

type Target = { id: string; ref: AnimatedRef<View> };
const Registration = createContext<(id: string, ref?: AnimatedRef<View>) => void>(() => {});
const Measurements = createContext<{ width: number; height: number; targets: SharedValue<Record<string, Bounds>> } | null>(null);
export function AttentionStage({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const host = useAnimatedRef<View>();
  const [targets, setTargets] = useState<Target[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const bounds = useSharedValue<Record<string, Bounds>>({});
  const [register] = useState(() => (id: string, ref?: AnimatedRef<View>) => setTargets(old => [...old.filter(target => target.id !== id), ...(ref ? [{ id, ref }] : [])]));
  const active = usePresentationValue("isActive");
  const preview = usePresentationValue("isPreview");
  const measureTargets = () => {
    "worklet";
    const root = measure(host);
    if (!root || !size.width || !size.height) return;
    const next: Record<string, Bounds> = {};
    for (const target of targets) {
      const box = measure(target.ref);
      if (box) next[target.id] = relativeBounds({ x: box.pageX, y: box.pageY, width: box.width, height: box.height },
        { x: root.pageX, y: root.pageY, width: root.width, height: root.height }, size);
    }
    const old = bounds.value;
    if (Object.keys(old).length !== Object.keys(next).length || Object.keys(next).some(id => !old[id] || Object.keys(next[id]).some(key => next[id][key as keyof Bounds] !== old[id][key as keyof Bounds]))) bounds.value = next;
  };
  const frame = useFrameCallback(measureTargets, false);
  useLayoutEffect(() => {
    runOnUI(measureTargets)();
    frame.setActive(active && !preview);
    return () => frame.setActive(false);
  }, [targets, size, active, preview, frame]);
  return <Registration.Provider value={register}><Measurements.Provider value={{ ...size, targets: bounds }}>
    <Animated.View ref={host} collapsable={false} style={[styles.stage, style]} onLayout={({ nativeEvent: { layout } }) => setSize(old => old.width === layout.width && old.height === layout.height ? old : { width: layout.width, height: layout.height })}>{children}</Animated.View>
  </Measurements.Provider></Registration.Provider>;
}
export function AttentionTarget({ id, children, style, frameStyle }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle>; frameStyle?: () => ViewStyle }) {
  const register = useContext(Registration);
  const ref = useAnimatedRef<View>();
  useLayoutEffect(() => { register(id, ref); return () => register(id); }, [id, ref, register]);
  const animatedStyle = useAnimatedStyle(() => frameStyle?.() ?? {});
  return <Animated.View ref={ref} collapsable={false} style={[style, animatedStyle]}>{children}</Animated.View>;
}
export function Spotlight({ target, darkness = 0.78, padding = 18 }: { target?: string; darkness?: number; padding?: number }) {
  const context = useContext(Measurements)!;
  const { targets, width, height } = context;
  const inner = useDerivedValue(() => {
    const box = target ? targets.value[target] : undefined;
    return { rect: { x: (box?.x ?? 0) - padding, y: (box?.y ?? 0) - padding, width: Math.max(1, (box?.width ?? width) + padding * 2), height: Math.max(1, (box?.height ?? height) + padding * 2) }, rx: 24, ry: 24 };
  }, [target, padding, width, height]);
  return <FrameView pointerEvents="none" frameStyle={() => { "worklet"; return [StyleSheet.absoluteFill, { opacity: target && targets.value[target] ? 1 : 0 }]; }}>
    <Canvas style={StyleSheet.absoluteFill}>
      <DiffRect outer={rrect(rect(0, 0, width, height), 0, 0)} inner={inner} color={`rgba(2,6,23,${Math.max(0, Math.min(1, darkness))})`} />
      <RoundedRect rect={inner} style="stroke" strokeWidth={2} color="#67e8f9" />
    </Canvas>
  </FrameView>;
}
export function Callout({ target, children, side = "above", width: requestedWidth = 380 }: { target: string; children: ReactNode; side?: "above" | "below" | "left" | "right"; width?: number }) {
  const { targets, width, height } = useContext(Measurements)!;
  const [labelHeight, setLabelHeight] = useState(90);
  const label = useDerivedValue(() => {
    const box = targets.value[target];
    return box ? calloutBounds(box, { width, height }, Math.min(requestedWidth, width - 24), labelHeight, side) : undefined;
  }, [target, width, height, requestedWidth, labelHeight, side]);
  const arrow = useDerivedValue(() => {
    const box = targets.value[target], position = label.value;
    if (!box || !position) return "";
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const x = position.x + position.width / 2, y = position.y + position.height / 2;
    const angle = Math.atan2(cy - y, cx - x);
    const ex = cx - Math.cos(angle) * Math.min(box.width, box.height) * 0.42, ey = cy - Math.sin(angle) * Math.min(box.width, box.height) * 0.42;
    return `M ${x} ${y} L ${ex} ${ey} M ${ex - Math.cos(angle - 0.5) * 16} ${ey - Math.sin(angle - 0.5) * 16} L ${ex} ${ey} L ${ex - Math.cos(angle + 0.5) * 16} ${ey - Math.sin(angle + 0.5) * 16}`;
  }, [target]);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Canvas style={StyleSheet.absoluteFill}><Path path={arrow} color="#67e8f9" style="stroke" strokeWidth={3} /></Canvas>
    <FrameView onLayout={({ nativeEvent: { layout } }) => setLabelHeight(layout.height)} frameStyle={() => { "worklet"; const box = label.value; return [styles.callout, { opacity: box ? 1 : 0, left: box?.x ?? 0, top: box?.y ?? 0, width: box?.width ?? requestedWidth }]; }}>
      {typeof children === "string" ? <Text style={styles.label}>{children}</Text> : children}
    </FrameView>
  </View>;
}
const styles = StyleSheet.create({ stage: { position: "relative", overflow: "hidden" },
  callout: { position: "absolute", backgroundColor: "#102431", borderColor: "#67e8f9", borderWidth: 2, borderRadius: 18, padding: 20 },
  label: { color: "#ecfeff", fontSize: 27, lineHeight: 35, fontWeight: "600" } });
