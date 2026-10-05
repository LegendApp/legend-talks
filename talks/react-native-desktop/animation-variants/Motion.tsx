import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, useAnimatedShaderUniforms } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export const traceRevealShader = `
uniform shader image;
uniform float2 resolution;
uniform float time;
uniform float strength;
half4 main(float2 p) {
  float progress=smoothstep(0.0,1.2,time);
  float edge=resolution.x*progress;
  float mask=1.0-smoothstep(edge-2.0,edge+2.0,p.x);
  half4 ink=image.eval(p);
  float shine=exp(-abs(p.x-edge)/max(1.0,resolution.x*0.015))*(1.0-smoothstep(1.0,1.4,time));
  return half4(min(ink.rgb+half3(0.3,0.85,1.0)*shine*ink.a,half3(ink.a)),ink.a)*mask;
}`;

export function Arrive({ children, delay = 0, fromX = 0, fromY = 24, clock = "slide", style }: {
  children: ReactNode; delay?: number; fromX?: number; fromY?: number;
  clock?: "slide" | "step"; style?: StyleProp<ViewStyle>;
}) {
  return <PlaybackKeyframeView clock={clock} delay={delay} previewTime={8} style={style} keyframes={[
    { time: 0, x: fromX, y: fromY, opacity: 0 },
    { time: 520, x: -fromX * 0.06, y: -fromY * 0.06, opacity: 1 },
    { time: 720, x: 0, y: 0, opacity: 1 },
  ]}>{children}</PlaybackKeyframeView>;
}

const emphasisShader = Skia.RuntimeEffect.Make(`
uniform float time;
uniform float width;
uniform float height;
uniform float mode;
float box(float2 p,float2 size,float r) {float2 q=abs(p)-size+r;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}
half4 main(float2 p) {
  float duration=1.35;
  float progress=clamp(time/duration,0.0,1.0);
  float2 size=float2(width,height);
  float d=abs(box(p-size*0.5,size*0.5-5.0,14.0));
  float border=exp(-d*0.8);
  float sweep=exp(-pow((p.x/width-progress)/0.07,2.0))*(1.0-smoothstep(1.0,1.5,time));
  float pulse=exp(-pow((time-0.5)*4.0,2.0));
  float alpha=mode<0.5 ? border*(0.35+0.65*pulse)+sweep*0.16 : sweep*0.45;
  return half4(half3(0.32,0.86,1.0)*alpha,alpha);
}`)!;

export function Emphasis({ width, height, mode = 0, clock = "step" }: {
  width: number; height: number; mode?: number; clock?: "slide" | "step";
}) {
  const uniforms = useAnimatedShaderUniforms({ width, height, mode }, 2, { clock });
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height }}>
    <Fill><Shader source={emphasisShader} uniforms={uniforms} /></Fill>
  </Canvas>;
}
