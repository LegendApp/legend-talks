import { useTitleBubbleSimulation } from "./useTitleBubbleSimulation";
import { dropletMaterial } from "./packs/backgrounds/dropletMaterial";
import { titleDripAnchors } from "./titleDripAnchors";
import { AlphaType, ColorType, Canvas, Fill, Shader, ImageShader, Skia, makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import { Background, useBackgroundSize, useBackgroundIntensity, useAdvanceAfterStep, useAnimatedShaderUniforms, usePresentationValue, snapshotCaptureQueue } from "@legend-apps/presentation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { AnimatedAtmosphere } from "./packs/backgrounds/AnimatedAtmosphere";
import { dropletGeometry } from "./packs/backgrounds/dropletGeometry";
import { TitleByline } from "./TitleByline";

export const waterTitleShader = `
uniform float time;
uniform float2 leftSource;
uniform float2 rightSource;
uniform float2 thirdSource;
uniform float stepIndex;
uniform float stepTime;
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
  return merge(merge(material(p,leftSource,time-0.6),material(p,rightSource,time-1.65),12.0),material(p,thirdSource,time-2.4),12.0);
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
  float3 color=float3(tone,tone+0.005,tone+0.01);
  float fade=stepIndex>=2.0 ? 1.0-smoothstep(2.2,3.4,stepTime) : 1.0;
  return half4(clamp(color,0.0,1.0)*alpha,alpha)*fade;
}`;
const waterEffect = Skia.RuntimeEffect.Make(waterTitleShader);
if (!waterEffect) throw new Error("Could not compile title water effect");

export const liquidTypeShader = `
uniform shader image;
half4 sourceInk(float2 p) { return image.eval(p); }
uniform float lineSplit;
uniform float glyphCount;
uniform float4 glyphs[64];
uniform float time;
uniform float stepIndex;
uniform float stepTime;
uniform float feedTime;
uniform float absorbedScale;
uniform float centerProgress;
uniform float2 exitCenter;
uniform float4 drops[72];
uniform float4 necks[72];
uniform float4 releasePulls[72];
uniform float3 impacts[18];
uniform float4 bestRect;
float growth() { return absorbedScale; }
float2 titleUV(float2 p) {
  float g=growth();
  float2 c=bestRect.xy+bestRect.zw*0.5;
  float2 moved=mix(c,float2(960,540),centerProgress);
  p-=moved-c;
  float halfWidth=bestRect.z*g*0.5;

  if(abs(p.x-c.x)<halfWidth) return c+(p-c)/g;
  return p-float2(sign(p.x-c.x)*(g-1.0)*bestRect.z*0.5,0);
}
half4 title(float2 p) {
  // Composite separately clipped source lines. A destination-space cutoff
  // sliced through the second line as the first line expanded.
  float split=lineSplit;
  float g=growth();
  float cy=bestRect.y+bestRect.w*.5;
  float movedY=mix(cy,540.0,centerProgress);
  float clearance=max(0.0,movedY-cy+bestRect.w*(g-1.0)*.5)+24.0*(g-1.0);
  float2 secondPoint=p-float2(0,clearance);
  half4 second=secondPoint.y>=split ? sourceInk(secondPoint) : half4(0);
  float2 q=titleUV(p);
  if(stepIndex<2.0) for(int i=0;i<18;i++) {
    float3 hit=impacts[i];
    float2 delta=q-hit.xy;
    float bulge=hit.z*exp(-dot(delta,delta)/1600.0)*0.18;
    q-=delta*bulge;
  }
  half4 first=q.y<split ? sourceInk(q) : half4(0);

  return first+second*(1.0-first.a);
}
float pulse(float2 p) {
  float cell=floor(p.x/64.0)+floor(p.y/128.0)*29.0;
  float seed=fract(sin(cell*127.1)*43758.5453);
  return pow(max(0.0,sin(time*0.9+seed*6.28318)),12.0);
}
half4 main(float2 p) {
  if(stepIndex>=2.0) {
    float t=stepTime*2.0;
    float2 original=bestRect.xy+bestRect.zw*.5;
    float2 local=(p-exitCenter)/max(.001,growth())+original;
    // Reverse absorption: outgoing mass tugs the actual glyph texture,
    // then a damped recoil relaxes the edge after the connecting neck breaks.
    float2 warp=float2(0);
    for(int i=0;i<72;i++) {
      float4 pull=releasePulls[i];
      if(pull.z<.001) continue;
      float2 anchor=(necks[i].xy-exitCenter)/max(.001,growth())+original;
      float2 delta=local-anchor;
      float influence=exp(-dot(delta,delta)/1000.0);
      warp+=(pull.xy/max(.2,growth())+delta*pull.z*.18)*influence;
    }
    float limit=42.0/max(.2,growth());
    local-=warp*min(1.0,limit/max(.001,length(warp)));
    half4 result=half4(0);
    if(growth()>.01 && local.x>bestRect.x && local.x<bestRect.x+bestRect.z && local.y>bestRect.y && local.y<bestRect.y+bestRect.w) result=sourceInk(local);
    float2 before=titleUV(p);
    if(before.x<bestRect.x || before.x>bestRect.x+bestRect.z || p.y>lineSplit) result+=title(p)*(1.0-smoothstep(0.0,1.0,t))*(1.0-result.a);
    for(int i=0;i<72;i++) {
      float4 drop=drops[i],neck=necks[i];
      if(drop.z<.1)continue;
      float2 size=float2(drop.z);
      if(drop.w==5.0) size=(drop.x<=10.0 || drop.x>=1910.0)?float2(drop.z*(1.0-.55*neck.w),drop.z*(1.0+2.3*neck.w)):float2(drop.z*(1.0+2.3*neck.w),drop.z*(1.0-.55*neck.w));
      float d=(length((p-drop.xy)/size)-1.0)*min(size.x,size.y);
      // Reuse the closing slide's four-bead impact splash, rotated inward
      // from whichever edge this simulated drop actually struck. neck.w is
      // the impact age normalized over 0.45s, so replay/reset stays in sync.
      if(drop.w==5.0 && neck.w<1.0) {
        float hit=neck.w*0.45;
        float fade=1.0-smoothstep(0.25,0.45,hit);
        float2 inward=drop.x<=10.0 ? float2(1,0) : drop.x>=1910.0 ? float2(-1,0)
          : drop.y<=10.0 ? float2(0,1) : float2(0,-1);
        float2 tangent=float2(-inward.y,inward.x);
        for(int bead=0;bead<4;bead++) {
          float side=float(bead)-1.5;
          float2 pos=drop.xy+tangent*side*85.0*hit
            +inward*(115.0*hit-230.0*hit*hit);
          d=min(d,length(p-pos)-2.7*fade);
        }
      }
      if(drop.w==3.0 && neck.z>0.0) {
        float2 segment=drop.xy-neck.xy;
        float u=clamp(dot(p-neck.xy,segment)/max(.001,dot(segment,segment)),0.0,1.0);
        float connection=length(p-mix(neck.xy,drop.xy,u))-drop.z*neck.z*.7;
        float h=max(8.0-abs(d-connection),0.0)/8.0;
        d=min(d,connection)-h*h*2.0;
      }
      float alpha=1.0-smoothstep(-.7,.7,d);
      result=half4(float3(.97)*alpha,alpha)+result*(1.0-alpha);
    }
    return result*(1.0-smoothstep(8.4,8.8,t));
  }

  float wave=sin(p.x*0.013-time*1.3+p.y*0.006);
  float amount=smoothstep(0.0,1.8,time);
  float2 q=p+float2(sin(p.y*0.028+time*0.7)*1.4,wave*2.2)*amount;
  float flash=pulse(p)*amount;
  // Tiny local expansion is perceived as a breathing letter, without moving the layout.
  float2 center=float2((floor(p.x/64.0)+0.5)*64.0,(floor(p.y/128.0)+0.5)*128.0);
  q=mix(q,center+(q-center)/(1.0+flash*0.025),amount);
  half4 ink=title(q);
  float halo=0.0;
  for(int i=0;i<8;i++) {
    float angle=float(i)*0.785398;
    float2 direction=float2(cos(angle),sin(angle));
    halo+=title(q+direction*4.0).a*0.075;
    halo+=title(q+direction*9.0).a*0.025;
  }
  float sweep=pow(max(0.0,sin(p.x*0.004-p.y*0.009-time*0.7)),18.0)*amount;
  float glow=halo*(0.10+flash*0.48+sweep*0.15)*(1.0-ink.a);
  float shade=0.94+0.06*wave*amount;
  float3 color=ink.rgb*shade+float3(0.94,0.97,1.0)*glow;
  float fade=stepIndex>=2.0 ? 1.0-smoothstep(0.5,2.8,stepTime) : 1.0;
  return half4(color,clamp(ink.a+glow,0.0,1.0))*fade;
}`;
export const cosmicShader = `
${dropletGeometry}
uniform float2 resolution;
uniform float4 drops[72];
uniform float whiten[18];
uniform float brightness;
${dropletMaterial}
uniform float time;
uniform float stepIndex;
uniform float stepTime;
uniform float4 bestRect;
float hash(float n) { return fract(sin(n*127.1)*43758.5453); }
half4 main(float2 p) {
  float2 c=bestRect.xy+bestRect.zw*0.5;
  float2 q=p-c;
  float3 light=float3(0);
  float alpha=0.0;
  float ending=stepIndex>=2.0 ? 1.0-smoothstep(2.5,3.5,stepTime) : 1.0;
  if(stepIndex>=1.0 && stepIndex<2.0) {
    float2 disk=float2(q.x+q.y*0.8,q.y*4.0);
    float r=length(disk);
    float rings=exp(-abs(r-210.0)/2.0)+exp(-abs(r-310.0)/1.1)*0.5;
    float angle=atan(disk.y,disk.x);
    light+=float3(0.5,0.66,0.9)*rings*0.18;
    light+=float3(0.45,0.55,0.75)*exp(-length(q)/130.0)*0.12;
    alpha=max(alpha,rings*0.45);

  }
  // Detached drops render independently above the background; they cannot
  // disappear into another parent after pinch-off.
  if(stepIndex==1.0) for(int i=0;i<18;i++) {
    float4 drop=drops[i];
    if(drop.w<1.0 || drop.w==6.0 || drop.z<0.1) continue;
    float distance=length(p-drop.xy);
    float fill=1.0-smoothstep(drop.z-1.0,drop.z+1.0,distance);
    float2 normal=(p-drop.xy)/max(distance,0.001);
    float3 glass=shadeDroplet((p-float2(960,540))/1080.0,(distance-drop.z)/1080.0,normal)*brightness;
    float edge=exp(-abs(distance-drop.z)/2.8);
    float lit=max(0.0,dot(normal,normalize(float2(-.6,-.8))));
    float3 white=float3(.93-edge*.20+edge*lit*.27);
    float blend=smoothstep(0.0,1.0,whiten[i]);
    float3 color=mix(glass,white,blend);
    light=mix(light,color,fill);
    alpha=max(alpha,fill);
  }
  alpha=clamp(alpha,0.0,1.0)*ending;
  return half4(clamp(light,0.0,1.0)*alpha,alpha);
}`;
const cosmicEffect = Skia.RuntimeEffect.Make(cosmicShader);
if (!cosmicEffect) throw new Error("Could not compile cosmic title");

const typeEffect = Skia.RuntimeEffect.Make(liquidTypeShader);
if (!typeEffect) throw new Error("Could not compile liquid title typography");

export default function WaterTitle({ children, closing = false, byline = false }: { children?: import("react").ReactNode; closing?: boolean; byline?: boolean }) {
  const step = usePresentationValue("stepIndex");
  useAdvanceAfterStep(closing ? -1 : 2, 4.45);
  const [sources, setSources] = useState({ leftSource: [460, 650], rightSource: [1450, 650], thirdSource: [1520, 650], lineSplit: 540, bestInkRect: [1190,400,255,128], glyphCount: 0, glyphs: Array(256).fill(0) as number[], bestRect: [1190, 400, 255, 128], bylineEnabled: 0, bylineSources: [0,0,0,0] });
  const measureByline = useCallback((points: number[]) => {
    setSources(old => ({ ...old, bylineEnabled: 1, bylineSources: points }));
  }, []);
  const [targets,setTargets]=useState<number[][]>([]);
  const visualUniforms = useAnimatedShaderUniforms(sources, 14, { clocks: { feedTime: 1 } });
  const { width, height } = useBackgroundSize();
  const intensity = useBackgroundIntensity();
  const speed = step >= 1 ? 1.8 : 0.6;
  // Read the persistent background clock; only the hosted atmosphere advances it.
  const backgroundUniforms = useAnimatedShaderUniforms({ ...sources,
    titleFeed: 1, resolution: [Math.max(1,width),Math.max(1,height)], brightness: 0.7*intensity,
  }, 8, { persistentBackground: "read" });
  const uniforms = useTitleBubbleSimulation(backgroundUniforms,targets,visualUniforms,byline && !closing);
  const titleRef = useRef<View>(null);
  const [titleImage, setTitleImage] = useState<SkImage>();
  const anchored = useRef(false);
  // Capture typography once after layout; only shader uniforms change on frames.
  useEffect(() => {
    if (anchored.current) return;
    let cancelled = false;
    const cancel = snapshotCaptureQueue.enqueue(async () => {
      const image = await makeImageFromView(titleRef);
      if (cancelled) { image?.dispose(); return; }
      if (image) {
        const pixels=image.readPixels(0,0,{width:image.width(),height:image.height(),colorType:ColorType.RGBA_8888,alphaType:AlphaType.Unpremul});
        const anchors=pixels instanceof Uint8Array ? titleDripAnchors(pixels,image.width(),image.height()) : null;
        anchored.current=true;
        if(anchors) { const {absorptionTargets,...geometry}=anchors; setSources(old=>({...old,...geometry}));setTargets(absorptionTargets ?? []); }
        setTitleImage(image);
      }
    });
    return () => { cancelled = true; cancel(); };
  }, [sources]);
  const showLiquidType = Boolean(titleImage);
  return <>
    <Background priority={1} intensityMultiplier={closing ? 1 : 3} maxIntensity={6}><AnimatedAtmosphere variant="droplets" brightness={0.7} speed={closing ? 0.6 : speed} sharedUniforms={uniforms} /></Background>
    {/* This slide disables template padding and owns its full layout. */}
    <View style={{ width: 1920, height: 1080 }}>
      <View style={{ flex: 1, opacity: showLiquidType ? 0 : 1, zIndex: showLiquidType ? 0 : 1 }}>
        <View ref={titleRef} collapsable={false} style={{ flex: 1, paddingHorizontal: 112, paddingVertical: 96, justifyContent: "center" }}>{children}</View>
      </View>
      {/* Native text metrics anchor the water to the same two-line heading. */}
      <Text accessible={false} pointerEvents="none" onTextLayout={event => {
        if(anchored.current) return;
        const lines = event.nativeEvent.lines;
        const last = lines[lines.length - 1];
        if (!last) return;
        const top = (1080 - (last.y + last.height) - 36) / 2;
        const baseline = top + last.y + last.ascender;
        const left = 112 + (1696 - last.width) / 2;
        const first = lines[0];
        const firstLeft = 112 + (1696 - first.width) / 2;
        const next = { bestInkRect: [1190,400,255,128], glyphCount: 0, glyphs: Array(256).fill(0) as number[], lineSplit: top + last.y - 4, leftSource: [left + 78, baseline], rightSource: [left + last.width - 175, baseline + 22], thirdSource: [left + last.width - 100, baseline + 22],
          bestRect: [firstLeft + first.width * 0.683, top + first.y, first.width * 0.151, 128] };
        setSources(old => {
          const measured = { ...old, ...next };
          return JSON.stringify(old) === JSON.stringify(measured) ? old : measured;
        });
      }} style={{ position: "absolute", left: 112, width: 1696, top: 0, opacity: 0, fontSize: 128, lineHeight: 128, fontWeight: "700", textAlign: "center" }}>
        {'React Native is the best way\nto build desktop apps'}
      </Text>
      <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
        {!closing && <Fill><Shader source={cosmicEffect!} uniforms={uniforms} /></Fill>}
        {!closing && showLiquidType && titleImage && <Fill><Shader source={typeEffect!} uniforms={uniforms}>
          <ImageShader image={titleImage} fit="fill" rect={{ x: 0, y: 0, width: 1920, height: 1080 }} />
        </Shader></Fill>}
        {closing && titleImage && <Fill><ImageShader image={titleImage} fit="fill" rect={{x:0,y:0,width:1920,height:1080}} /></Fill>}
        {closing && <Fill><Shader source={waterEffect!} uniforms={uniforms} /></Fill>}
      </Canvas>
      {byline && !closing && <TitleByline uniforms={uniforms} onMeasure={measureByline} />}
    </View>
  </>;
}
