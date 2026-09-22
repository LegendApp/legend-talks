import { Canvas, Fill, Shader, ImageShader, Skia, makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms, usePresentationValue, snapshotCaptureQueue } from "@legend-apps/presentation";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { DeckBackground } from "./DeckBackground";

export const waterTitleShader = `
uniform float time;
uniform float2 leftSource;
uniform float2 rightSource;
float merge(float a,float b,float k) {
  k=max(k,0.001);
  float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);
  return mix(b,a,h)-k*h*(1.0-h);
}
float ellipse(float2 p,float2 r) { return (length(p/r)-1.0)*min(r.x,r.y); }
float material(float2 p,float2 source,float local) {
  if(local<0.0) return 10000.0;
  float period=3.4;
  float age=mod(local,period);
  float form=smoothstep(0.0,1.65,age);
  float released=step(2.05,age);
  float fall=max(0.0,age-2.05);
  float stretch=smoothstep(1.15,2.05,age);
  float radius=mix(1.0,9.0,form);
  float tip=source.y+4.0+form*10.0+stretch*23.0;
  float2 q=p-source;
  // A wide attachment flows out of the glyph and narrows into a filament.
  // Pinch the filament before release; retract the remaining meniscus afterward.
  float neckLength=mix(tip-source.y,5.0,smoothstep(2.05,2.33,age));
  float u=clamp(q.y/max(1.0,neckLength),0.0,1.0);
  float pinch=smoothstep(1.65,2.05,age)*(1.0-released);
  float neckWidth=mix(8.0,4.0,u)*(1.0-pinch*0.94*sin(u*3.14159));
  float neck=max(abs(q.x)-neckWidth,max(-q.y-5.0,q.y-neckLength));
  neck=max(neck,abs(q.x)-8.0);
  float d=neck;
  float dropY=tip+510.0*fall*fall;
  float dropShape=ellipse(p-float2(source.x,dropY),float2(radius,radius*(1.0+0.45*stretch)*(1.0-0.2*min(1.0,fall))));
  if(dropY<1034.0) d=merge(d,dropShape,5.0*(1.0-released));
  float impact=2.05+sqrt(max(1.0,1030.0-(source.y+37.0))/510.0);
  float accumulated=max(0.0,local-impact);
  float volume=1.0-exp(-accumulated/26.0);
  float onset=smoothstep(0.0,0.22,accumulated);
  float rx=(24.0+112.0*sqrt(volume))*onset;
  float ry=(5.0+17.0*sqrt(volume))*onset;
  if(onset>0.001) {
    float2 pool=p-float2(source.x,1035.0);
    float wobble=sin(pool.x*0.043+local*1.2)*0.7*exp(-abs(pool.x)/100.0);
    float poolD=ellipse(pool-float2(0,wobble),float2(max(1.0,rx),max(1.0,ry)));
    d=min(d,poolD);
  }
  // Two impact histories keep a splash continuous across the next drop cycle.
  for(int previous=0;previous<2;previous++) {
    float hit=age+float(previous)*period-impact;
    if(hit>=0.0 && hit<0.65 && local>=impact+float(previous)*period) {
      float fade=1.0-smoothstep(0.30,0.65,hit);
      for(int bead=0;bead<4;bead++) {
        float side=float(bead)-1.5;
        float2 pos=float2(source.x+side*85.0*hit,1030.0-115.0*hit+230.0*hit*hit);
        d=min(d,length(p-pos)-2.7*fade);
      }
      float mound=ellipse(p-float2(source.x,1033.0),float2(13.0+hit*20.0,4.0+sin(hit/0.65*3.14159)*12.0));
      d=merge(d,mound,5.0);
    }
  }
  return d;
}
float field(float2 p) {
  return min(material(p,leftSource,time-0.6),material(p,rightSource,time-1.65));
}
half4 main(float2 p) {
  float d=field(p);
  float alpha=1.0-smoothstep(-0.7,0.7,d);
  if(alpha<0.001) return half4(0);
  float2 normal=float2(field(p+float2(0.65,0))-field(p-float2(0.65,0)),field(p+float2(0,0.65))-field(p-float2(0,0.65)));
  normal=normal/max(0.001,length(normal));
  float edge=exp(-abs(d)/2.8);
  float light=clamp(dot(normal,normalize(float2(-0.6,-0.8))),0.0,1.0);
  float tone=0.93-edge*0.20+edge*light*0.27;
  // Match the white typography at the attachment, then reveal a glossy curved surface.
  float nearLetter=1.0-smoothstep(0.0,16.0,min(length(p-leftSource),length(p-rightSource)));
  float3 color=mix(float3(tone,tone+0.005,tone+0.01),float3(0.973,0.98,0.988),nearLetter);
  return half4(clamp(color,0.0,1.0)*alpha,alpha);
}`;
const waterEffect = Skia.RuntimeEffect.Make(waterTitleShader);
if (!waterEffect) throw new Error("Could not compile title water effect");

export const liquidTypeShader = `
uniform shader image;
uniform float time;
float pulse(float2 p) {
  float cell=floor(p.x/64.0)+floor(p.y/128.0)*29.0;
  float seed=fract(sin(cell*127.1)*43758.5453);
  return pow(max(0.0,sin(time*0.9+seed*6.28318)),12.0);
}
half4 main(float2 p) {
  float wave=sin(p.x*0.013-time*1.3+p.y*0.006);
  float amount=smoothstep(0.0,1.8,time);
  float2 q=p+float2(sin(p.y*0.028+time*0.7)*1.4,wave*2.2)*amount;
  float flash=pulse(p)*amount;
  // Tiny local expansion is perceived as a breathing letter, without moving the layout.
  float2 center=float2((floor(p.x/64.0)+0.5)*64.0,(floor(p.y/128.0)+0.5)*128.0);
  q=mix(q,center+(q-center)/(1.0+flash*0.025),amount);
  half4 ink=image.eval(q);
  float halo=0.0;
  for(int i=0;i<8;i++) {
    float angle=float(i)*0.785398;
    float2 direction=float2(cos(angle),sin(angle));
    halo+=image.eval(q+direction*4.0).a*0.075;
    halo+=image.eval(q+direction*9.0).a*0.025;
  }
  float sweep=pow(max(0.0,sin(p.x*0.004-p.y*0.009-time*0.7)),18.0)*amount;
  float glow=halo*(0.10+flash*0.48+sweep*0.15)*(1.0-ink.a);
  float shade=0.94+0.06*wave*amount;
  float3 color=ink.rgb*shade+float3(0.94,0.97,1.0)*glow;
  return half4(color,clamp(ink.a+glow,0.0,1.0));
}`;
const typeEffect = Skia.RuntimeEffect.Make(liquidTypeShader);
if (!typeEffect) throw new Error("Could not compile liquid title typography");

export default function WaterTitle({ children }: { children?: import("react").ReactNode }) {
  const [sources, setSources] = useState({ leftSource: [420, 650], rightSource: [1510, 650] });
  const uniforms = useAnimatedShaderUniforms(sources, 14);
  const phase = usePresentationValue("playbackPhase");
  const titleRef = useRef<View>(null);
  const [titleImage, setTitleImage] = useState<SkImage>();
  // Capture typography once after layout; only shader uniforms change on frames.
  useEffect(() => {
    let cancelled = false;
    const cancel = snapshotCaptureQueue.enqueue(async () => {
      const image = await makeImageFromView(titleRef);
      if (cancelled) { image?.dispose(); return; }
      if (image) setTitleImage(image);
    });
    return () => { cancelled = true; cancel(); };
  }, [sources]);
  const showLiquidType = Boolean(titleImage) && (phase === "playing" || phase === "preview");
  return <>
    <DeckBackground />
    <View style={{ width: 1920, height: 1080 }}>
      <View style={{ flex: 1, opacity: showLiquidType ? 0 : 1 }}>
        <View ref={titleRef} collapsable={false} style={{ flex: 1, paddingHorizontal: 112, paddingVertical: 96, justifyContent: "center" }}>{children}</View>
      </View>
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
        {showLiquidType && titleImage && <Fill><Shader source={typeEffect!} uniforms={uniforms}>
          <ImageShader image={titleImage} fit="fill" rect={{ x: 0, y: 0, width: 1920, height: 1080 }} />
        </Shader></Fill>}
        <Fill><Shader source={waterEffect!} uniforms={uniforms} /></Fill>
      </Canvas>
    </View>
  </>;
}
