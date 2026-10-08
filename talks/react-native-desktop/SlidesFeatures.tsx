import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import type { ReactNode } from "react";
import { GlassPanels } from "./GlassPanels";
import { SlidesHeader } from "./StoryDiagrams";

const panels = [0, 584, 1168].map(x => ({ x: x + 4, y: 240, width: 520, height: 600, radius: 28 }));
const tilePanel = [{ x: 6, y: 6, width: 108, height: 108, radius: 22 }];
const paths = [0, 1, 2].map(index => Array.from({ length: 97 }, (_, frame) => {
  const time = frame / 96 * 6000;
  const phase = time / 6000 * Math.PI * 2 + index * Math.PI * 2 / 3;
  return { time, x: 150 * Math.cos(phase), y: 155 * Math.sin(phase), opacity: 1 };
}));

// Moving refraction and surface lighting are evaluated entirely in Skia.
export const featuresGlassShader = `
uniform float time;
half4 main(float2 p) {
  float2 q=(p-float2(260,290))/260.0;
  float2 center=float2(.13*sin(time*.8),-.12+.09*cos(time*.7));
  float2 v=q-center;
  float r=length(v);
  float radius=.43+.015*sin(time*1.2);
  float edge=r-radius;
  float inside=1.0-smoothstep(-.006,.006,edge);
  float z=sqrt(max(0.0,1.0-pow(r/radius,2.0)));
  float2 warped=q+v*z*.32;
  float grid=min(abs(fract(warped.x*5.0)-.5),abs(fract(warped.y*5.0)-.5));
  float3 color=float3(.025,.08,.13)*exp(-grid*90.0);
  color+=float3(.025,.12,.20)*inside*(.3+z);
  float rim=exp(-abs(edge)*120.0);
  float light=.25+.75*pow(max(0.0,dot(normalize(float3(v,z*.45)),normalize(float3(-.6,-.8,.8)))),3.0);
  color+=float3(.48,.84,1)*rim*light;
  color+=float3(.75,.92,1)*exp(-length(v-float2(-.18,-.27))*45.0)*inside;
  float pool=length((q-float2(0,.63))/float2(1.0,.28));
  float wave=sin(pool*36.0-time*3.0);
  color+=float3(.10,.40,.60)*pow(max(0.0,wave),9.0)*exp(-pool*1.9)*smoothstep(.23,.45,q.y);
  float fade=1.0-smoothstep(.88,1.1,abs(q.x));
  float alpha=clamp(max(color.r,max(color.g,color.b))*1.6,0.0,1.0)*fade;
  return half4(min(color*fade,float3(alpha)),alpha);
}`;
const glassEffect = Skia.RuntimeEffect.Make(featuresGlassShader);
if (!glassEffect) throw new Error("Could not compile Slides feature glass");

function MotionDemo() {
  return <View style={{ width: 520, height: 580 }}>
    {paths.map((keyframes, index) => <PlaybackKeyframeView key={index} keyframes={keyframes}
      repeatDuration={6000} clock="slide" previewTime={1.5}
      style={{ position: "absolute", left: 200, top: 230, width: 120, height: 120 }}>
      <GlassPanels panels={tilePanel} width={120} height={120} />
      <View style={{ position: "absolute", left: 39, top: 39, width: 42, height: 42, zIndex: 1,
        borderRadius: index === 1 ? 10 : 21, backgroundColor: ["#67e8f9", "#bba6ff", "#e6faff"][index] }} />
    </PlaybackKeyframeView>)}
  </View>;
}
export function SlidesFeatures({ icon, children, showHeader = true }: { icon: string; children: ReactNode; showHeader?: boolean }) {
  const uniforms = useAnimatedShaderUniforms({}, 3);
  return <View style={{ width: 1696, height: 880 }}>
    {showHeader && <SlidesHeader icon={icon} />}
    <GlassPanels panels={panels} width={1696} height={880} />
    <View collapsable={false} pointerEvents="box-none" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      {["Reanimated", "Skia", "TypeGPU"].map((label, index) => <Text key={label}
        style={{ position: "absolute", top: 160, left: index * 584, width: 528, textAlign: "center", color: "#f8fafc", fontSize: 48, fontWeight: "600" }}>{label}</Text>)}
      <View style={{ position: "absolute", top: 250, left: 4 }}><MotionDemo /></View>
      <Canvas style={{ position: "absolute", top: 250, left: 588, width: 520, height: 580 }}>
        <Fill><Shader source={glassEffect!} uniforms={uniforms} /></Fill>
      </Canvas>
      <View style={{ position: "absolute", top: 250, left: 1172 }}>{children}</View>
    </View>
  </View>;
}

const authorPanels = [{ x: 4, y: 230, width: 910, height: 600 }, { x: 1004, y: 230, width: 688, height: 600 }];
const source = [
  ['# Hello desktop', '#f8fafc'], ['', '#fff'],
  ['Written in **Markdown**', '#c4b5fd'], ['', '#fff'],
  ['<View className="rounded-2xl', '#67e8f9'],
  ['  bg-cyan-950 p-8">', '#67e8f9'],
  ['  <Text className="text-4xl', '#67e8f9'],
  ['    text-white">', '#67e8f9'],
  ['    Native UI', '#f8fafc'],
  ['  </Text>', '#67e8f9'],
  ['</View>', '#67e8f9'],
];
export function SlidesAuthoring({ icon, showHeader = true }: { icon: string; showHeader?: boolean }) {
  return <View style={{ width: 1696, height: 880 }}>
    {showHeader && <SlidesHeader icon={icon} />}
    <GlassPanels panels={authorPanels} width={1696} height={880} />
    <Text style={{ position: "absolute", top: 150, left: 4, width: 910, color: "#f8fafc", fontSize: 42, textAlign: "center", fontWeight: "600" }}>Markdown + React Native</Text>
    <Text style={{ position: "absolute", top: 150, left: 1004, width: 688, color: "#f8fafc", fontSize: 42, textAlign: "center", fontWeight: "600" }}>Your slide</Text>
    <View style={{ position: "absolute", left: 48, top: 265 }}>
      {source.map(([text, color], i) => <Text key={i} style={{ color, fontFamily: "Menlo", fontSize: 30, lineHeight: 43 }}>{text || ' '}</Text>)}
    </View>
    <Text style={{ position: "absolute", top: 495, left: 923, width: 72, color: "#67e8f9", fontSize: 48, textAlign: "center" }}>→</Text>
    <View style={{ position: "absolute", left: 1048, top: 350, width: 600, alignItems: "center", gap: 34 }}>
      <Text style={{ color: "#f8fafc", fontSize: 58, fontWeight: "700" }}>Hello desktop</Text>
      <Text style={{ color: "#f8fafc", fontSize: 32 }}>Written in <Text style={{ fontWeight: "700" }}>Markdown</Text></Text>
      <View className="rounded-2xl bg-cyan-950 p-8"><Text className="text-4xl text-white">Native UI</Text></View>
    </View>
  </View>;
}
