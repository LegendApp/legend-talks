import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { AppCarousel } from "./AppCarousel";
import { GlassPanels } from "./GlassPanels";
import { MovingTitle } from "./MovingTitle";

const containerPanels = [{ x: 5, y: 5, width: 1170, height: 650, radius: 28 }];
const examples = ["Platform Fit", "OS Integration", "Latest OS Features"] as const;
// Illustrative native controls, not screenshots. All motion samples the host
// playback controller, including the synchronized values in separate windows.
export const nativeUIShader = `
uniform float time;
uniform float stage;
float box(float2 p,float2 c,float2 h,float r) { float2 q=abs(p-c)-h+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
half4 put(half4 c,float d,half3 tint,float a) { a*=1.0-smoothstep(-0.7,0.7,d); return half4(tint*a,a)+c*(1.0-a); }
float hash(float2 p) { return fract(sin(dot(p,float2(127.1,311.7)))*43758.5453); }
float segment(float2 p,float2 a,float2 b) { float2 v=b-a; return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0)); }
half4 main(float2 p) {
  half4 c=half4(0);
  float value=0.5+0.35*sin(time*1.3);
  float on=smoothstep(-0.15,0.15,sin(time*1.3));
  if(stage<0.5) {
    for(int platform=0;platform<2;platform++) {
      float x=platform==0?325.0:855.0;
      bool mac=platform==0;
      c=put(c,box(p,float2(x,295),float2(245,230),mac?22.0:9.0),mac?half3(0.16,0.19,0.23):half3(0.12,0.14,0.18),1.0);
      c=put(c,abs(box(p,float2(x,295),float2(245,230),mac?22.0:9.0))-0.7,half3(0.4,0.48,0.57),0.8);
      float selected=floor(mod(time*0.45,3.0));
      half3 accent=mac?half3(0.04,0.48,1.0):half3(0.38,0.80,1.0);
      if(mac) {
        // macOS segmented picker: inset track and raised glass selection.
        c=put(c,box(p,float2(x,145),float2(175,22),22),half3(0.10,0.12,0.15),1.0);
        float d=box(p,float2(x-116.0+selected*116.0,145),float2(57,20),20);
        c=put(c,d,half3(0.34,0.37,0.42),1.0);
        c=put(c,abs(d)-0.6,half3(0.69,0.72,0.77),0.55);
      } else {
        // Fluent navigation uses a compact accent indicator, not a Mac pill.
        c=put(c,box(p,float2(x-116.0+selected*116.0,169),float2(16,2),2),accent,1.0);
      }
      float2 toggle=float2(x+128,245);
      float td=box(p,toggle,float2(mac?31.0:29.0,mac?18.0:14.0),mac?18.0:14.0);
      c=put(c,td,mix(half3(0.22,0.24,0.27),accent,on),1.0);
      if(!mac)c=put(c,abs(td)-0.8,half3(0.75),1.0-on);
      float2 knob=toggle+float2(mix(-14.0,14.0,on),0);
      if(mac) {
        c=put(c,length(p-knob)-15.0,half3(0.97),1.0);
        c=put(c,abs(length(p-knob)-14.0)-0.6,half3(0.75,0.85,0.95),0.6);
      } else {
        // WinUI switch thumb is small and dark against the accent when on.
        c=put(c,length(p-knob)-8.0,mix(half3(0.83),half3(0.08,0.13,0.17),on),1.0);
      }
      c=put(c,box(p,float2(x,345),float2(175,mac?3.0:2.0),2),half3(0.39),1.0);
      c=put(c,box(p,float2(x-175.0+175.0*value,345),float2(175.0*value,mac?3.0:2.0),2),accent,1.0);
      float2 thumb=float2(x-175.0+350.0*value,345);
      c=put(c,length(p-thumb)-(mac?12.0:15.0),mac?half3(0.96):half3(0.28,0.30,0.33),1.0);
      if(!mac)c=put(c,length(p-thumb)-9.0,accent,1.0);
      for(int i=0;i<3;i++) {
        float2 radio=float2(x-135.0+float(i)*135.0,440);
        bool checked=float(i)==selected;
        float r=mac?10.0:12.0;
        c=put(c,length(p-radio)-r,checked?accent:half3(0.13),1.0);
        if(!checked)c=put(c,abs(length(p-radio)-r)-0.7,half3(0.67),1.0);
        if(checked)c=put(c,length(p-radio)-(mac?4.0:6.0),mac?half3(1):half3(0.08,0.13,0.17),1.0);
      }
    }
  } else {
    // Thick branching light carries updates outward and edits back to the hub.
    float2 hub=float2(590,135);
    float3 energy=float3(0);
    for(int branch=0;branch<3;branch++) {
      float2 end=branch==0?float2(220,260):branch==1?float2(960,260):float2(590,475);
      float2 axis=end-hub;
      float distance=length(axis);
      float2 along=axis/distance;
      float2 across=float2(-along.y,along.x);
      float x=dot(p-hub,along);
      // Local cell lookup keeps dense streams bounded in cost, like the portal.
      for(int lane=0;lane<12;lane++) {
        float l=float(lane);
        float direction=lane<6?1.0:-1.0;
        float speed=direction*(90.0+hash(float2(l,float(branch)))*95.0);
        float cell=floor((x-time*speed)/29.0);
        for(int neighbor=-1;neighbor<=1;neighbor++) {
          float id=cell+float(neighbor);
          float seed=hash(float2(id+l*17.0,float(branch)+l));
          float position=(id+seed)*29.0+time*speed;
          float t=clamp(position/distance,0.0,1.0);
          float spread=sin(t*3.14159);
          float offset=((l-5.5)*7.0+sin(t*9.0-time*1.2+l)*11.0)*spread;
          float2 point=hub+along*position+across*offset;
          float d=length(p-point);
          float size=0.55+pow(seed,3.0)*3.8;
          float brightness=0.3+hash(float2(id+8.0,l))*1.8;
          float fade=smoothstep(0.0,18.0,position)*(1.0-smoothstep(distance-15.0,distance,position));
          float glow=exp(-d/size)*1.4+exp(-d/(size*4.0))*0.15;
          float3 tint=lane<6?float3(0.25,0.8,1):float3(0.7,0.45,1);
          energy+=tint*glow*brightness*fade;
        }
      }
    }
    float halo=exp(-length((p-hub)/float2(145,57)))*0.45;
    energy+=float3(0.12,0.5,1)*halo;
    float energyAlpha=clamp(max(energy.r,max(energy.g,energy.b)),0.0,1.0);
    c=half4(min(energy,float3(energyAlpha)),energyAlpha)+c*(1.0-energyAlpha);
    float hubPulse=sin(time*1.3)*2.0;
    c=put(c,box(p,hub,float2(110,34)+hubPulse,22)-8.0,half3(0.1,0.5,0.85),0.18);
    c=put(c,box(p,hub,float2(110,34)+hubPulse,22),half3(0.13,0.27,0.4),1.0);
    c=put(c,abs(box(p,hub,float2(110,34)+hubPulse,22))-1.0,half3(0.65,0.92,1),0.9);
    for(int window=0;window<3;window++) {
      float2 center=window==0?float2(590,455):window==1?float2(220,280):float2(960,280);
      c=put(c,box(p,center,float2(180,95),14),half3(0.07,0.13,0.2),1.0);
      c=put(c,abs(box(p,center,float2(180,95),14))-1.0,half3(0.4,0.72,0.94),0.8);
      for(int button=0;button<3;button++)c=put(c,length(p-(center+float2(-156.0+float(button)*19.0,-75)))-5.0,button==0?half3(1,0.4,0.4):button==1?half3(1,0.76,0.35):half3(0.3,0.8,0.45),1.0);
      for(int bar=0;bar<4;bar++) {
        float h=15.0+(0.5+0.5*sin(time*1.3+float(bar)))*55.0;
        c=put(c,box(p,center+float2(-115.0+float(bar)*77.0,65.0-h*0.5),float2(23,h*0.5),5),half3(0.22,0.67,0.95),1.0);
      }
    }
  }
  return c;
}`;
const effect = Skia.RuntimeEffect.Make(nativeUIShader);
if (!effect) throw new Error("Could not compile native UI examples");

function Example({ index, width, height }: { index: number; width: number; height: number }) {
  const step = usePresentationValue("stepIndex");
  const uniforms = useAnimatedShaderUniforms({ stage: index }, 2, { clock: index });
  return <View style={{ width: 1180, height: 738, transformOrigin: "top left", transform: [{ scale: width / 1180 }] }}>
    <GlassPanels panels={containerPanels} width={1180} height={670} pulse={0.001} edgeMotion={0.5} />
    <Text style={{ color: "white", fontSize: 38, fontWeight: "600", textAlign: "center", marginBottom: 18, marginTop: 20 }}>{examples[index]}</Text>
    {index < 2 ? <>
      <Canvas style={{ width: 1180, height: 560 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
      {index === 1 && <Text style={{ position: "absolute", left: 470, top: 199, width: 240, textAlign: "center", color: "white", fontSize: 24, fontWeight: "600" }}>Shared state</Text>}
      {index === 0 && [0, 1].map(platform => <View key={platform} pointerEvents="none" style={{ position: "absolute", left: platform === 0 ? 30 : 560, top: 84, width: 590, height: 520 }}>
        <View style={{ position: "absolute", left: 120, top: 132, width: 350, flexDirection: "row" }}>
          {["Day", "Week", "Month"].map(label => <Text key={label} style={{ width: 116, color: "white", textAlign: "center", fontFamily: platform === 0 ? "Helvetica Neue" : "Segoe UI", fontSize: 19 }}>{label}</Text>)}
        </View>
        <Text style={{ position: "absolute", left: 120, top: 231, color: "white", fontSize: 23 }}>Notifications</Text>
        <Text style={{ position: "absolute", left: 120, top: 293, color: "#c4d0dd", fontSize: 20 }}>Volume</Text>
      </View>)}
      {index === 0 && <View style={{ position: "absolute", left: 60, right: 60, top: 96, flexDirection: "row" }}>
        {["macOS", "Windows"].map(label => <Text key={label} style={{ width: 530, textAlign: "center", color: "white", fontSize: 28 }}>{label}</Text>)}
      </View>}
    </> : <View style={{ height: 560, overflow: "hidden", borderRadius: 18, borderColor: "#66849b", borderWidth: 1 }}>
      <SceneMotionView pose={{ scaleX: step === 2 ? 1.65 : 1, scaleY: step === 2 ? 1.65 : 1, y: step === 2 ? -130 : 0 }} duration={6500} style={{ width: 1180, height: 560, backgroundColor: "#102032" }}>
        <View style={{ position: "absolute", left: 20, top: 25, bottom: 20, width: 235, borderRadius: 12, backgroundColor: "#1c3044" }} />
        {[0, 1, 2, 3].map(i => <View key={i} style={{ position: "absolute", left: 290 + i % 2 * 100, top: 45 + i * 87, width: 610, height: 62, borderRadius: 14, backgroundColor: i % 2 ? "#254d71" : "#20364b" }} />)}
        <Text style={{ position: "absolute", top: 205, left: 290, width: 780, textAlign: "center", color: "white", fontSize: 28 }}>Chat History scrolling video</Text>
        <View style={{ position: "absolute", left: 285, bottom: 30, width: 840, height: 92, borderRadius: 24, backgroundColor: "#7396b344", borderColor: "#c6eaff", borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "white", fontSize: 26 }}>Liquid Glass composer</Text>
        </View>
      </SceneMotionView>
    </View>}
  </View>;
}

export function NativeUIMatters() {
  const step = Math.min(usePresentationValue("stepIndex"), 2);
  return <View style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "white", fontSize: 64, fontWeight: "700", textAlign: "center" }}>Native UI Matters</Text>
    </MovingTitle>
    <AppCarousel items={examples} position={step} renderCard={(name, card) => <Example index={examples.indexOf(name)} width={card.width} height={card.height} />} />
  </View>;
}
