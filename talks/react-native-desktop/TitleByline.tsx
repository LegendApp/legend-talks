import { snapshotCaptureQueue } from "@legend-apps/presentation";
import { AlphaType, Canvas, ColorType, Fill, ImageShader, Shader, Skia, makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { bylineDotSources, bylineHeight, bylineTop } from "./bylineDotSources";

export const titleBylineShader = `
uniform shader image;
uniform float time;
uniform float stepIndex;
uniform float stepTime;
uniform float centerProgress;
uniform float bylineEnabled;
uniform float4 bylineSources;
uniform float4 drops[72];
float merge(float a,float b,float k) {
  k=max(.001,k);
  float h=clamp(.5+.5*(b-a)/k,0.0,1.0);
  return mix(b,a,h)-k*h*(1.0-h);
}
half4 main(float2 p) {
  if(p.y<${bylineTop - 48}.0 || p.y>${bylineTop + bylineHeight + 8}.0) return half4(0);
  float visible=1.0-smoothstep(.18,.52,centerProgress);
  if(stepIndex>=2.0) visible*=1.0-smoothstep(0.0,.5,stepTime);
  if(visible<.001) return half4(0);
  float2 q=p;
  for(int i=0;i<18;i++) {
    float4 drop=drops[i];
    if(drop.w!=1.0 || drop.z<.1) continue;
    float2 delta=p-drop.xy;
    float distance=length(delta);
    q+=delta/max(1.0,distance)*sin(distance*.09-time*2.0)
      *exp(-dot(delta,delta)/3600.0)*1.2;
  }
  half4 ink=image.eval(q);
  float d=10000.0;
  if(bylineEnabled>.5) for(int i=0;i<2;i++) {
    float2 source=i==0 ? bylineSources.xy : bylineSources.zw;
    float4 drop=drops[16+i];
    float dotRadius=8.5;
    float bubble=10000.0;
    if(stepIndex==1.0 && drop.w==6.0 && drop.z>.1) {
      float reach=clamp((source.y-drop.y-6.0)/26.0,0.0,1.0);
      dotRadius+=sin(reach*3.14159)*1.8;
      float2 segment=drop.xy-source;
      float u=clamp(dot(p-source,segment)/max(1.0,dot(segment,segment)),0.0,1.0);
      float pinch=smoothstep(.65,1.0,reach);
      float width=mix(8.5,3.2,u)*(1.0-pinch*.94*sin(u*3.14159));
      float neck=length(p-mix(source,drop.xy,u))-width;
      bubble=merge(length(p-drop.xy)-drop.z,neck,3.0*(1.0-pinch));
    }
    d=min(d,merge(length(p-source)-dotRadius,bubble,2.0));
  }
  float alpha=1.0-smoothstep(-.7,.7,d);
  float edge=exp(-abs(d)/2.5);
  float tone=.97-edge*.16;
  half4 liquid=half4(float3(tone,tone+.01,tone+.02)*alpha,alpha);
  return (liquid+ink*(1.0-alpha))*visible;
}`;
const bylineEffect = Skia.RuntimeEffect.Make(titleBylineShader);
if (!bylineEffect) throw new Error("Could not compile title byline");

export function TitleByline({ uniforms, onMeasure }: {
  uniforms: { readonly value: Record<string, number | number[]> };
  onMeasure: (points: number[]) => void;
}) {
  const captureRef = useRef<View>(null);
  const [image, setImage] = useState<SkImage>();
  useEffect(() => {
    let cancelled = false;
    let captured: SkImage | undefined;
    const cancel = snapshotCaptureQueue.enqueue(async () => {
      const next = await makeImageFromView(captureRef);
      if (cancelled) { next?.dispose(); return; }
      if (!next) return;
      const pixels = next.readPixels(0, 0, { width: next.width(), height: next.height(), colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
      const points = pixels instanceof Uint8Array ? bylineDotSources(pixels, next.width(), next.height()) : null;
      if (!points) { next.dispose(); return; }
      captured = next;
      onMeasure(points);
      setImage(next);
    });
    return () => { cancelled = true; cancel(); captured?.dispose(); };
  }, [onMeasure]);
  return <>
    <View ref={captureRef} collapsable={false} pointerEvents="none"
      style={{ position: "absolute", left: 0, top: bylineTop, width: 1920, height: bylineHeight, opacity: image ? 0 : 1, justifyContent: "center" }}>
      <Text accessibilityLabel="Jay · Legend · Margelo" style={{ color: "#e2e8f0", fontSize: 56, lineHeight: 80, fontWeight: "500", textAlign: "center" }}>
        Jay<Text style={{ fontSize: 112 }}>{"  ·  "}</Text>Legend<Text style={{ fontSize: 112 }}>{"  ·  "}</Text>Margelo
      </Text>
    </View>
    {image && <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
      <Fill><Shader source={bylineEffect!} uniforms={uniforms}>
        <ImageShader image={image} fit="fill" rect={{ x: 0, y: bylineTop, width: 1920, height: bylineHeight }} />
      </Shader></Fill>
    </Canvas>}
  </>;
}
