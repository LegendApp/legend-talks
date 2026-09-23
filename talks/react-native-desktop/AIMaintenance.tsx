import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

import { branchMaterialShader } from "./BranchMaterial";

const implementations = ["iOS", "Android", "Mac", "Windows", "Web"];
const branchX = (index: number) => 168 + index * 340;
const ease = (t: number) => t * t * (3 - 2 * t);

export const maintenanceTreeShader = `
uniform float time;
uniform float stepIndex;
uniform float stepTime;
${branchMaterialShader}
half4 main(float2 p) {
  float t=clamp((p.y-70.0)/500.0,0.0,1.0);
  float bend=t*t*(3.0-2.0*t);
  // Step identity and elapsed time come from the same UI-thread clock snapshot.
  float colorMix=step(0.5,stepIndex)*smoothstep(0.0,1.2,stepTime);
  float3 tint=mix(float3(0.08,0.58,1.0),float3(1.0,0.08,0.14),colorMix);
  float3 light=mix(float3(0.6,0.91,1.0),float3(1.0,0.65,0.65),colorMix);
  float3 color=float3(0);
  for(int i=0;i<5;i++) {
    float endpoint=168.0+float(i)*340.0;
    float center=mix(848.0,endpoint,bend);
    float slope=(endpoint-848.0)*6.0*t*(1.0-t)/500.0;
    for(int strand=0;strand<2;strand++) {
      float phase=float(i)*0.7+float(strand)*3.14159;
      float offset=sin(t*8.0+phase)*sin(t*3.14159)*13.0;
      float d=(p.x-center-offset)/sqrt(1.0+slope*slope);
      float fade=smoothstep(65.0,90.0,p.y)*(1.0-smoothstep(570.0,585.0,p.y));
      float3 ribbon=branchRibbon(d,t,phase,time,tint,light);
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
const warmupStarts = [750, 1650, 2425, 3075, 3625, 4075, 4425];
const steadyStart = 4725;
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
const trajectories = routes.map((lane) => Array.from({ length: 41 }, (_, sample) => {
  const t = sample / 40;
  return { time: t * travelDuration, x: 848 + (branchX(lane) - 848) * ease(t),
    y: 70 + t * 500, opacity: Math.min(1, t / 0.08, (1 - t) / 0.10) };
}));

function CryingStream() {
  return <>
    {trajectories.map((keyframes, index) => <PlaybackKeyframeView key={index}
      keyframes={keyframes} delay={steadyStart + index * emissionInterval} repeatDuration={cycleDuration} previewTime={12}
      style={{ position: "absolute", left: -30, top: -35 }}>
      <Text style={{ fontSize: 58, lineHeight: 72 }}>😭</Text>
    </PlaybackKeyframeView>)}
    {warmupStarts.map((delay, index) => <PlaybackKeyframeView key={`intro-${index}`}
      keyframes={trajectories[index]} delay={delay} previewTime={12}
      style={{ position: "absolute", left: -30, top: -35 }}>
      <Text style={{ fontSize: 58, lineHeight: 72 }}>😭</Text>
    </PlaybackKeyframeView>)}
  </>;
}

export function AIMaintenance() {
  const maintenance = usePresentationValue("stepIndex") > 0;
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <MovingTitle><Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 88, fontWeight: "600", textAlign: "center" }}>{maintenance ? "You maintain it five times" : "AI can write it five times"}</Text></MovingTitle>
    <View style={{ position: "absolute", left: 0, top: 120, width: 1696, height: 650 }}>
      <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
      <Text style={{ position: "absolute", top: 0, left: 600, width: 496, textAlign: "center", color: maintenance ? "#fda4af" : "#8de4ff", fontSize: 40, lineHeight: 52 }}>{maintenance ? "One bug fix" : "One feature"}</Text>
      {maintenance && <CryingStream />}
      {implementations.map((name, index) => <View key={name} style={{ position: "absolute", left: branchX(index) - 125, top: 600, width: 250, alignItems: "center" }}>
        <Text style={{ color: "#f1f5f9", fontSize: 40, lineHeight: 52, textAlign: "center", fontWeight: "600" }}>{name}</Text>
        <SceneMotionView hidden={!maintenance} pose={{ opacity: maintenance ? 1 : 0 }} duration={450} style={{ marginTop: 12 }}>
          <Text style={{ color: "#fda4af", fontSize: 24 }}>Fix + verify</Text>
        </SceneMotionView>
      </View>)}
    </View>
  </View>;
}
