import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { AppCarousel } from "./AppCarousel";
import { MovingTitle } from "./MovingTitle";

const examples = ["Platform Fit", "One app, multiple windows", "Latest OS Features"] as const;
// Illustrative native controls, not screenshots. All motion samples the host
// playback controller, including the synchronized values in separate windows.
export const nativeUIShader = `
uniform float time;
uniform float stage;
float box(float2 p,float2 c,float2 h,float r) { float2 q=abs(p-c)-h+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
half4 put(half4 c,float d,half3 tint,float a) { a*=1.0-smoothstep(-0.7,0.7,d); return half4(tint*a,a)+c*(1.0-a); }
float segment(float2 p,float2 a,float2 b) { float2 v=b-a; return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0)); }
half4 main(float2 p) {
  half4 c=half4(0);
  float value=0.5+0.35*sin(time*1.3);
  float on=smoothstep(-0.15,0.15,sin(time*1.3));
  if(stage<0.5) {
    for(int platform=0;platform<2;platform++) {
      float x=platform==0?295.0:885.0;
      bool mac=platform==0;
      c=put(c,box(p,float2(x,295),float2(245,230),mac?22.0:9.0),mac?half3(0.16,0.19,0.23):half3(0.12,0.14,0.18),1.0);
      c=put(c,abs(box(p,float2(x,295),float2(245,230),mac?22.0:9.0))-0.7,half3(0.4,0.48,0.57),0.8);
      // Native-style segmented selection, switch, slider, and radio buttons.
      c=put(c,box(p,float2(x,145),float2(175,23),mac?9.0:4.0),half3(0.23,0.26,0.3),1.0);
      float selected=floor(mod(time*0.45,3.0));
      c=put(c,box(p,float2(x-116.0+selected*116.0,145),float2(56,20),mac?7.0:3.0),mac?half3(0.42,0.46,0.5):half3(0.18,0.36,0.48),1.0);
      c=put(c,box(p,float2(x+128,245),float2(32,17),17),mix(half3(0.35),half3(0.15,0.65,0.92),on),1.0);
      c=put(c,length(p-float2(x+112.0+on*32.0,245))-13.0,half3(0.95),1.0);
      c=put(c,box(p,float2(x,345),float2(175,mac?3.0:2.0),2),half3(0.35,0.39,0.44),1.0);
      c=put(c,box(p,float2(x-175.0+175.0*value,345),float2(175.0*value,3),2),half3(0.2,0.65,0.98),1.0);
      c=put(c,length(p-float2(x-175.0+350.0*value,345))-(mac?11.0:13.0),half3(0.93),1.0);
      for(int i=0;i<3;i++) {
        float cx=x-135.0+float(i)*135.0;
        c=put(c,abs(length(p-float2(cx,440))-11.0)-1.4,half3(0.65,0.72,0.8),1.0);
        if(float(i)==selected)c=put(c,length(p-float2(cx,440))-6.0,half3(0.22,0.68,1),1.0);
      }
    }
  } else {
    // Curved luminous branches carry pulses between three independent windows.
    for(int branch=0;branch<2;branch++) {
      float side=branch==0?-1.0:1.0;
      float u=clamp((p.x-590.0)/(side*350.0),0.0,1.0);
      float2 nearest=float2(590.0+side*350.0*u,370.0-130.0*u+sin(u*3.14159)*85.0);
      float d=length(p-nearest);
      c=put(c,d-1.3,half3(0.2,0.65,0.95),0.7);
      c=put(c,d-6.0,half3(0.12,0.4,0.7),0.12);
      for(int point=0;point<5;point++) {
        float particle=fract(time*0.25+float(point)/5.0);
        float2 spark=float2(590.0+side*350.0*particle,370.0-130.0*particle+sin(particle*3.14159)*85.0);
        float sd=length(p-spark);
        c=put(c,sd-8.0,half3(0.15,0.65,1),0.16);
        c=put(c,sd-2.5,half3(0.65,0.94,1),0.95);
      }
    }
    for(int window=0;window<3;window++) {
      float2 center=window==0?float2(590,375):window==1?float2(220,175):float2(960,175);
      c=put(c,box(p,center,float2(195,120),14),half3(0.07,0.13,0.2),1.0);
      c=put(c,abs(box(p,center,float2(195,120),14))-1.0,half3(0.4,0.72,0.94),0.8);
      for(int button=0;button<3;button++)c=put(c,length(p-(center+float2(-172.0+float(button)*19.0,-98)))-5.0,button==0?half3(1,0.4,0.4):button==1?half3(1,0.76,0.35):half3(0.3,0.8,0.45),1.0);
      for(int bar=0;bar<4;bar++) {
        float h=20.0+(0.5+0.5*sin(time*1.3+float(bar)))*75.0;
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
    <Text style={{ color: "white", fontSize: 38, fontWeight: "600", textAlign: "center", marginBottom: 18 }}>{examples[index]}</Text>
    {index < 2 ? <>
      <Canvas style={{ width: 1180, height: 560 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
      {index === 0 && [0, 1].map(platform => <View key={platform} pointerEvents="none" style={{ position: "absolute", left: platform * 590, top: 64, width: 590, height: 520 }}>
        <View style={{ position: "absolute", left: 120, top: 132, width: 350, flexDirection: "row" }}>
          {["Day", "Week", "Month"].map(label => <Text key={label} style={{ width: 116, color: "white", textAlign: "center", fontSize: 19 }}>{label}</Text>)}
        </View>
        <Text style={{ position: "absolute", left: 120, top: 231, color: "white", fontSize: 23 }}>Notifications</Text>
        <Text style={{ position: "absolute", left: 120, top: 293, color: "#c4d0dd", fontSize: 20 }}>Volume</Text>
      </View>)}
      {index === 0 && <View style={{ position: "absolute", left: 0, right: 0, top: 76, flexDirection: "row" }}>
        {["macOS", "Windows"].map(label => <Text key={label} style={{ width: 590, textAlign: "center", color: "white", fontSize: 28 }}>{label}</Text>)}
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
