import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { SlidesHeader } from "./StoryDiagrams";
import { GitHubLink } from "./GitHubLink";

// Procedural screenshot placeholder. Each shard samples the same image before
// flying away; the clock, rotation, gravity and lighting all run on the GPU.
export const slidesShatterShader = `
uniform float time;
uniform float stepIndex;
float box(float2 p,float2 size,float r) {
  float2 q=abs(p)-size+r;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;
}
float mask(float d) { return 1.0-smoothstep(-1.0,1.0,d); }
float4 screenshot(float2 p) {
  float edge=box(p,float2(660,260),18.0);
  float a=mask(edge);
  float3 c=float3(0.025,0.065,0.11);
  c+=float3(0.18,0.6,0.9)*exp(-abs(edge)*0.7);
  c+=float3(0.025,0.04,0.06)*step(p.y,-210.0);
  for(int i=0;i<3;i++) {
    float dot=mask(length(p-float2(-630.0+float(i)*22.0,-235))-6.0);
    c=mix(c,i==0?float3(1,0.3,0.35):i==1?float3(1,0.75,0.2):float3(0.2,0.85,0.45),dot);
  }
  // Presenter thumbnails, large audience preview, and speaker notes.
  for(int i=0;i<4;i++) {
    float d=box(p-float2(-550,-155.0+float(i)*102.0),float2(82,41),6.0);
    c+=float3(0.07,0.16,0.23)*mask(d)+float3(0.1,0.35,0.5)*exp(-abs(d));
  }
  float screen=box(p-float2(70,-55),float2(485,135),10.0);
  c+=float3(0.015,0.08,0.13)*mask(screen);
  float orb=length((p-float2(60,-55))/float2(170,85));
  c+=float3(0.08,0.42,0.65)*exp(-abs(orb-1.0)*38.0)*mask(screen);
  for(int i=0;i<4;i++) {
    float line=box(p-float2(-25,119.0+float(i)*29.0),float2(370.0-float(i)*35.0,3),3.0);
    c+=float3(0.3,0.4,0.5)*mask(line);
  }
  return float4(c*a,a);
}
half4 main(float2 p) {
  p-=float2(960,570);
  if(stepIndex<1.0) return half4(0);
  if(stepIndex<2.0) {
    float entrance=smoothstep(0.0,0.65,time);
    float2 source=(p-float2(0,48.0*(1.0-entrance)))/mix(0.9,1.0,entrance);
    return screenshot(source)*entrance;
  }
  float t=max(time,0.0);
  if(t>3.2) return half4(0);
  float4 color=float4(0);
  for(int y=0;y<5;y++) for(int x=0;x<8;x++) {
    float id=float(y*8+x);
    float2 home=float2(-577.5+float(x)*165.0,-208.0+float(y)*104.0);
    float seed=fract(sin(id*78.23+1.0)*43758.54);
    float2 velocity=float2(home.x*(0.6+seed),-240.0-seed*420.0);
    float2 center=home+velocity*t+float2(0,720.0*t*t);
    float angle=(seed-0.5)*t*11.0;
    float2 q=p-center;
    q=float2(q.x*cos(angle)+q.y*sin(angle),-q.x*sin(angle)+q.y*cos(angle));
    float d=box(q,float2(82.5,52),0.0);
    float a=mask(d);
    float4 piece=screenshot(q+home)*a;
    float glint=exp(-abs(d)*1.3)*piece.a*(0.5+0.5*sin(t*17.0+id));
    piece.rgb+=float3(0.45,0.85,1)*glint*min(t*8.0,1.0);
    color=piece+color*(1.0-piece.a);
  }
  float flash=exp(-t*14.0)*exp(-length(p)/430.0)*min(t*50.0,1.0);
  color.rgb+=float3(0.5,0.85,1)*flash;
  color.a=max(color.a,flash);
  return half4(min(color.rgb,float3(color.a)),color.a);
}`;
const effect = Skia.RuntimeEffect.Make(slidesShatterShader);
if (!effect) throw new Error("Could not compile Slides screenshot shatter");
const linkReveal = [{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];

export function SlidesReveal({ icon }: { icon: string }) {
  const step = usePresentationValue("stepIndex");
  const uniforms = useAnimatedShaderUniforms({}, 4, { clock: "step" });
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    <SceneMotionView pose={{ y: step === 0 ? 300 : 0 }} duration={650} style={{ zIndex: 2 }}>
      <SlidesHeader icon={icon} />
    </SceneMotionView>
    <Canvas pointerEvents="none" accessibilityLabel="Legend Slides screenshot placeholder"
      style={{ position: "absolute", left: -112, top: -100, width: 1920, height: 1180 }}>
      <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
    </Canvas>
    {step >= 2 && <View style={{ position: "absolute", top: 405, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} delay={1600} previewTime={4}>
        <GitHubLink repository="LegendApp/legend-apps" label="Legend Slides on GitHub" />
      </PlaybackKeyframeView>
    </View>}
  </View>;
}
