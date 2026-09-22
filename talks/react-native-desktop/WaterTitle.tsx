import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { useState } from "react";
import { Text, View } from "react-native";
import { DeckBackground } from "./DeckBackground";

export const waterTitleShader = `
uniform float time;
uniform float2 leftSource;
uniform float2 rightSource;
float drop(float2 p, float2 center, float radius, float stretch) {
  return length((p-center)/float2(radius,radius*stretch))-1.0;
}
half4 main(float2 p) {
  float t=max(0.0,time-0.7);
  float level=1072.0-70.0*(1.0-exp(-max(0.0,t-1.3)/45.0));
  float wave=sin(p.x*0.025-t*1.7)*1.4+sin(p.x*0.011+t)*2.0;
  float surface=level+wave;
  float body=smoothstep(surface-1.0,surface+2.0,p.y)*smoothstep(0.0,3.0,max(0.0,t-1.3));
  float3 color=float3(0.015,0.14,0.22)*body;
  float alpha=body*0.78;
  float rim=exp(-abs(p.y-surface)/1.8)*smoothstep(0.0,3.0,max(0.0,t-1.3));
  color+=rim*float3(0.35,0.85,1.0)*0.8;
  for(int emitter=0;emitter<2;emitter++) {
    float2 source=emitter==0 ? leftSource : rightSource;
    float local=t-float(emitter)*0.67;
    float period=2.2+float(emitter)*0.31;
    float cycle=floor(max(0.0,local)/period);
    float age=mod(max(0.0,local),period);
    float grow=clamp(age/0.65,0.0,1.0);
    float fall=max(0.0,age-0.65);
    float radius=5.8+float(emitter)*0.9;
    float y=source.y+5.0+650.0*fall*fall;
    float x=source.x+sin(cycle*2.7)*fall*3.0;
    float d=drop(p,float2(x,y),radius*max(0.08,grow),1.0+min(0.8,fall));
    float visible=step(0.0,local)*(1.0-step(surface+14.0,y));
    float ink=(1.0-smoothstep(-0.2,0.1,d))*visible;
    float edge=exp(-abs(d)/0.15)*visible;
    float spec=exp(-length(p-float2(x-radius*0.3,y-radius*0.45))/1.6)*visible;
    color+=ink*float3(0.035,0.3,0.42)+edge*float3(0.4,0.8,0.95)*0.6+spec;
    alpha=max(alpha,ink*0.85);
    // Ripples and ballistic spray continue after each impact, including the prior cycle.
    float impact=0.65+sqrt(max(1.0,level-source.y-5.0)/650.0);
    for(int previous=0;previous<2;previous++) {
      float a=age+float(previous)*period-impact;
      float live=step(0.0,a)*(1.0-smoothstep(0.7,1.3,a))*step(0.0,local-float(previous)*period);
      float ring=abs(length((p-float2(source.x,surface))/float2(1.0,0.18))-max(0.0,a)*110.0);
      float shine=exp(-ring/2.2)*live;
      color+=shine*float3(0.25,0.8,1.0)*0.8;
      alpha=max(alpha,shine*0.65);
      for(int bit=0;bit<6;bit++) {
        float v=float(bit)-2.5;
        float2 pos=float2(source.x+v*a*42.0,surface-(120.0-abs(v)*20.0)*a+200.0*a*a);
        float spray=exp(-length(p-pos)/1.9)*live*(1.0-step(surface+2.0,pos.y));
        color+=spray*float3(0.55,0.9,1.0);
        alpha=max(alpha,spray*0.85);
      }
    }
  }
  return half4(min(color,float3(1.0))*alpha,alpha);
}`;
const waterEffect = Skia.RuntimeEffect.Make(waterTitleShader);
if (!waterEffect) throw new Error("Could not compile title water effect");

export default function WaterTitle({ children }: { children?: import("react").ReactNode }) {
  const [sources, setSources] = useState({ leftSource: [420, 650], rightSource: [1510, 650] });
  const uniforms = useAnimatedShaderUniforms(sources, 8);
  return <>
    <DeckBackground />
    <View style={{ width: 1920, height: 1080 }}>
      <View style={{ flex: 1, paddingHorizontal: 112, paddingVertical: 96, justifyContent: "center" }}>{children}</View>
      {/* Native text metrics anchor the water to the same two-line heading. */}
      <Text accessible={false} pointerEvents="none" onTextLayout={event => {
        const lines = event.nativeEvent.lines;
        const last = lines[lines.length - 1];
        if (!last) return;
        const top = (1080 - (last.y + last.height) - 36) / 2;
        const baseline = top + last.y + last.ascender;
        const left = 112 + (1696 - last.width) / 2;
        const next = { leftSource: [left + 23, baseline], rightSource: [left + last.width - 31, baseline] };
        setSources(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
      }} style={{ position: "absolute", left: 112, width: 1696, top: 0, opacity: 0, fontSize: 128, lineHeight: 128, fontWeight: "700", textAlign: "center" }}>
        {'React Native is the best way\nto build desktop apps'}
      </Text>
      <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
        <Fill><Shader source={waterEffect!} uniforms={uniforms} /></Fill>
      </Canvas>
    </View>
  </>;
}
