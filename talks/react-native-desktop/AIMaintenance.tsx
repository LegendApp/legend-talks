import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

const implementations = ["React Native", "AppKit", "SwiftUI", "Electron", "Tauri", "Deno", "Flutter", "Compose", "GPUI"];
const branchX = (index: number) => 96 + index * 188;
const ease = (t: number) => t * t * (3 - 2 * t);

export const maintenanceTreeShader = `
uniform float time;
uniform float maintenance;
half4 main(float2 p) {
  float t=clamp((p.y-70.0)/500.0,0.0,1.0);
  float bend=t*t*(3.0-2.0*t);
  float3 tint=mix(float3(0.08,0.58,1.0),float3(1.0,0.08,0.14),maintenance);
  float3 light=mix(float3(0.6,0.91,1.0),float3(1.0,0.65,0.65),maintenance);
  float3 color=float3(0);
  for(int i=0;i<9;i++) {
    float endpoint=96.0+float(i)*188.0;
    float center=mix(848.0,endpoint,bend);
    float slope=(endpoint-848.0)*6.0*t*(1.0-t)/500.0;
    for(int strand=0;strand<2;strand++) {
      float phase=float(i)*0.7+float(strand)*3.14159;
      float offset=sin(t*8.0+phase)*sin(t*3.14159)*13.0;
      float d=(p.x-center-offset)/sqrt(1.0+slope*slope);
      float pulse=0.5+0.5*sin(time*1.4-t*6.0+phase);
      float radius=mix(14.0,3.0,t)*(0.9+pulse*0.2);
      float n=d/radius;
      float body=1.0-smoothstep(0.8,1.12,abs(n));
      float edge=exp(-abs(abs(d)-radius*0.87)*0.9);
      float ridge=exp(-pow((n+0.3)*4.0,2.0));
      float flow=pow(0.5+0.5*sin(t*22.0-time*3.0+phase),8.0);
      float fade=smoothstep(65.0,90.0,p.y)*(1.0-smoothstep(570.0,585.0,p.y));
      float3 ribbon=tint*(body*0.35+ridge*body*0.55+exp(-abs(d)/(radius*2.0))*0.08)
        +light*(edge*0.6+flow*body*0.35);
      color=max(color,ribbon*fade);
    }
    float tip=length(p-float2(endpoint,570.0));
    color+=tint*(exp(-tip*0.25)+exp(-tip*0.065)*0.16);
  }
  float alpha=clamp(max(color.r,max(color.g,color.b)),0.0,1.0);
  return half4(min(color,float3(alpha)),alpha);
}`;
const effect = Skia.RuntimeEffect.Make(maintenanceTreeShader);
if (!effect) throw new Error("Could not compile maintenance tree");
const emissionInterval = 300;
const travelDuration = 1900;
const warmupStarts = [3000, 3900, 4675, 5325, 5875, 6325, 6675];
const steadyStart = 6975;
const introDuration = steadyStart + travelDuration;
// Precompute varied routes once. A single native clock keeps emissions evenly
// spaced; no timers, frame callbacks or per-cycle JS lane selection.
const routes = Array.from({ length: 3 }, () => {
  const lanes = implementations.map((_, index) => index);
  for (let index = lanes.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [lanes[index], lanes[other]] = [lanes[other], lanes[index]];
  }
  return lanes;
}).flat();
const cycleDuration = routes.length * emissionInterval;
const trajectories = routes.map((lane, index) => {
  const start = index * emissionInterval;
  const times = new Set([0, cycleDuration]);
  for (let sample = 0; sample <= 40; sample++) times.add((start + sample / 40 * travelDuration) % cycleDuration);
  const inputRange = [...times].sort((a, b) => a - b);
  const phases = inputRange.map(time => ((time - start + cycleDuration) % cycleDuration) / travelDuration);
  return {
    start,
    inputRange,
    x: phases.map(t => 848 + (branchX(lane) - 848) * ease(Math.min(t, 1))),
    y: phases.map(t => 70 + Math.min(t, 1) * 500),
    opacity: phases.map(t => t > 1 ? 0 : Math.min(1, t / 0.08, (1 - t) / 0.10)),
  };
});

const warmupTrajectories = warmupStarts.map((start, index) => {
  const inputRange = [0, start, ...Array.from({ length: 40 }, (_, sample) => start + (sample + 1) / 40 * travelDuration), introDuration];
  const phases = inputRange.map(time => Math.max(0, Math.min(1, (time - start) / travelDuration)));
  return {
    inputRange,
    x: phases.map(t => 848 + (branchX(routes[index]) - 848) * ease(t)),
    y: phases.map(t => 70 + t * 500),
    opacity: phases.map(t => Math.min(1, t / 0.08, (1 - t) / 0.10)),
  };
});

function CryingStream() {
  const active = usePresentationValue("isActive");
  const preview = usePresentationValue("isPreview");
  const preparing = usePresentationValue("isPreparing");
  const progress = useRef(new Animated.Value(2300)).current;
  const intro = useRef(new Animated.Value(introDuration)).current;
  useEffect(() => {
    if (!active || preview || preparing) { progress.setValue(2300); intro.setValue(introDuration); return; }
    progress.setValue(0);
    intro.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(intro, { toValue: introDuration, duration: introDuration, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
      Animated.sequence([
        Animated.timing(progress, { toValue: 0, duration: steadyStart, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
        Animated.loop(Animated.timing(progress, {
          toValue: cycleDuration, duration: cycleDuration, easing: Easing.linear,
          useNativeDriver: true, isInteraction: false,
        })),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [active, preview, preparing, progress, intro]);
  return <>{trajectories.map((trajectory, index) => <Animated.Text key={index} style={{
    position: "absolute", left: -30, top: -35, fontSize: 58, lineHeight: 72,
    opacity: Animated.multiply(
      progress.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.opacity }),
      intro.interpolate({ inputRange: [0, steadyStart + (trajectory.start + travelDuration > cycleDuration ? travelDuration - 1 : 0), steadyStart + (trajectory.start + travelDuration > cycleDuration ? travelDuration : 1)], outputRange: [0, 0, 1], extrapolate: "clamp" }),
    ),
    transform: [
      { translateX: progress.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.x }) },
      { translateY: progress.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.y }) },
    ],
  }}>😭</Animated.Text>)}
    {warmupTrajectories.map((trajectory, index) => <Animated.Text key={`intro-${index}`} style={{ position: "absolute", left: -30, top: -35, fontSize: 58, lineHeight: 72,
      opacity: intro.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.opacity }),
      transform: [
        { translateX: intro.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.x }) },
        { translateY: intro.interpolate({ inputRange: trajectory.inputRange, outputRange: trajectory.y }) },
      ],
    }}>😭</Animated.Text>)}
  </>;
}

export function AIMaintenance() {
  const maintenance = usePresentationValue("stepIndex") > 0;
  const uniforms = useAnimatedShaderUniforms({ maintenance: maintenance ? 1 : 0 }, 8);
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <MovingTitle><Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 88, fontWeight: "600", textAlign: "center" }}>{maintenance ? "You maintain it nine times" : "AI can write it nine times"}</Text></MovingTitle>
    <View style={{ position: "absolute", left: 0, top: 120, width: 1696, height: 650 }}>
      <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
      <Text style={{ position: "absolute", top: 0, left: 600, width: 496, textAlign: "center", color: maintenance ? "#fda4af" : "#8de4ff", fontSize: 40, lineHeight: 52 }}>{maintenance ? "One bug fix" : "One feature"}</Text>
      {maintenance && <CryingStream />}
      {implementations.map((name, index) => <View key={name} style={{ position: "absolute", left: branchX(index) - 91, top: 600, width: 182, alignItems: "center" }}>
        <Text style={{ color: "#f1f5f9", fontSize: 25, lineHeight: 34, textAlign: "center", fontWeight: name === "React Native" ? "700" : "500" }}>{name}</Text>
        <SceneMotionView hidden={!maintenance} pose={{ opacity: maintenance ? 1 : 0 }} duration={450} style={{ marginTop: 12 }}>
          <Text style={{ color: "#fda4af", fontSize: 24 }}>Fix + verify</Text>
        </SceneMotionView>
      </View>)}
    </View>
  </View>;
}
