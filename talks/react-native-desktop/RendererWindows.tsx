import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// Illustrative controls, not embedded OS widgets. All motion is evaluated in SkSL.
export const rendererShader = `
uniform float time;
uniform float family;
float box(float2 p, float2 halfSize, float r) {
  float2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float segment(float2 p, float2 a, float2 b) {
  float2 d = b-a;
  return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.0,1.0));
}
float mask(float d) { return 1.0-smoothstep(-0.7,0.7,d); }
float3 glass(float d, float y, float strength) {
  float inside = mask(d);
  float sheen = 0.65 + 0.35*cos(y*0.017);
  float rim = exp(-abs(d)*1.25);
  return float3(0.07,0.2,0.32)*inside*strength*sheen
    + float3(0.5,0.86,1.0)*rim*(0.58+0.2*cos(y*0.018))
    + float3(0.15,0.48,0.7)*exp(-abs(d)*0.17)*0.11;
}
half4 main(float2 p) {
  float frame = box(p-float2(264,209),float2(244,177),22.0);
  float3 c = glass(frame,p.y,0.6);
  float a = mask(frame)*0.86+exp(-abs(frame)*0.22)*0.12;
  float clip = mask(frame);
  float chrome = exp(-abs(p.y-76.0))*step(24.0,p.x)*step(p.x,504.0);
  c += float3(0.3,0.5,0.65)*chrome*0.3;
  for(int i=0;i<3;i++) {
    float dotD=length(p-float2(44.0+17.0*float(i),54.0))-3.5;
    c += float3(0.5,0.67,0.78)*mask(dotD);
  }
  if(family<0.5) {
    float toggle=smoothstep(-0.45,0.45,sin(time*1.05));
    float track=box(p-float2(344,151),float2(63,27),27.0);
    c += glass(track,p.y,0.6+toggle);
    float knob=length(p-float2(308.0+72.0*toggle,151))-22.0;
    c += glass(knob,p.y,2.0)+float3(0.35,0.57,0.65)*mask(knob);
    float press=pow(0.5+0.5*sin(time*1.7),6.0);
    float button=box(p-float2(167,151+press*3.0),float2(62.0-press*3.0,27.0-press*3.0),15.0);
    c += glass(button,p.y,1.8-press*0.8);
    c += float3(0.28,0.65,0.8)*mask(button)*(1.0-press)*0.36;
    float rail=box(p-float2(264,281),float2(159,5),5.0);
    c += glass(rail,p.y,0.8);
    float x=151.0+226.0*(0.5+0.5*sin(time*0.8-0.5));
    float fill=box(p-float2((105.0+x)*0.5,281),float2((x-105.0)*0.5,4),4.0);
    c += float3(0.22,0.75,0.9)*mask(fill);
    float thumb=length(p-float2(x,281))-18.0;
    c += glass(thumb,p.y,2.6);
  } else if(family<1.5) {
    float page=box(p-float2(264,222),float2(197,115),14.0);
    c += glass(page,p.y,0.8);
    float sweep=107.0+230.0*(0.5+0.5*sin(time*0.7));
    float scanDistance=(p.y-sweep)/26.0;
    float light=exp(-scanDistance*scanDistance)*mask(page);
    c += float3(0.09,0.38,0.53)*light*0.5;
    // A soft scan reveals the page's layout without adding another text layer.
    for(int i=0;i<3;i++) {
      float row=box(p-float2(264,284.0+float(i)*14.0),float2(106.0-float(i)*20.0,2),2.0);
      c += float3(0.2,0.55,0.7)*mask(row)*(0.12+light*0.6);
    }
    float chevron=min(segment(p,float2(227,184),float2(202,209)),segment(p,float2(202,209),float2(227,234)));
    chevron=min(chevron,min(segment(p,float2(301,184),float2(326,209)),segment(p,float2(326,209),float2(301,234))));
    chevron=min(chevron,segment(p,float2(275,173),float2(253,245)));
    c += float3(0.3,0.85,1.0)*(exp(-chevron*0.9)*1.1+exp(-chevron*0.12)*0.17);
  } else {
    float phase=mod(time,7.0);
    float progress=smoothstep(0.3,4.5,phase);
    float fade=1.0-smoothstep(5.6,7.0,phase);
    float2 q=p-float2(166,217);
    float angle=mod(atan(q.y,q.x)+1.5707963+6.2831853,6.2831853)/6.2831853;
    float circle=abs(length(q)-57.0);
    float arc=step(angle,progress)*fade;
    c += float3(0.3,0.82,1.0)*(exp(-circle*1.1)+exp(-circle*0.17)*0.14)*arc;
    float2 end=float2(sin(progress*6.2831853),-cos(progress*6.2831853))*57.0+float2(166,217);
    c += float3(0.5,0.9,1.0)*exp(-length(p-end)*0.16)*fade;
    float2 r=p-float2(354,217);
    float rect=abs(box(r,float2(65,64),17.0));
    float rectAngle=mod(atan(r.y,r.x)+1.5707963+6.2831853,6.2831853)/6.2831853;
    float trace=step(rectAngle,progress)*fade;
    c += float3(0.3,0.82,1.0)*(exp(-rect*1.1)+exp(-rect*0.17)*0.14)*trace;
  }
  c *= clip;
  return half4(min(c,float3(1.0))*a,a);
}`;
const effect = Skia.RuntimeEffect.Make(rendererShader);
if (!effect) throw new Error("Could not compile renderer windows");

function GlassWindow({ family }: { family: number }) {
  const uniforms = useAnimatedShaderUniforms({ family }, 3.8);
  return <Canvas style={{ width: 528, height: 410 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>;
}

const families = [
  ["Native views", "OS UI toolkit"],
  ["Browser content", "HTML + CSS"],
  ["Framework-drawn", "Custom renderer"],
];

export function RendererFamilies() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1696, height: 650, marginTop: 50, flexDirection: "row", gap: 56, alignSelf: "center" }}>
    {families.map(([name, description], index) => <SceneMotionView key={name}
      pose={{ opacity: step >= index ? 1 : 0.2 }} duration={600} style={{ width: 528, alignItems: "center" }}>
      <GlassWindow family={index} />
      <Text style={{ color: "#f8fafc", fontSize: 38, fontWeight: "600", marginTop: 22 }}>{name}</Text>
      <Text style={{ color: "#e5f2fa", fontSize: 29, marginTop: 16 }}>{description}</Text>
    </SceneMotionView>)}
  </View>;
}
