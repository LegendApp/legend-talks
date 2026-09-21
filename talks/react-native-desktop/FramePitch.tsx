import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";
import { rootRibbonShader } from "./SharedRoots";
import { MovingTitle } from "./MovingTitle";
import { objectionGlassShader } from "./DesktopObjections";

const effect = Skia.RuntimeEffect.Make(objectionGlassShader
  .replace("float elapsed = min(mix(time,6.0,settled),6.0);", "float elapsed = clamp(time,0.0,6.0);")
  .replaceAll("-240.0", "-65.0").replaceAll("238.0", "65.0")
  .replaceAll("-245.0", "-65.0").replaceAll("246.0", "65.0"));
if (!effect) throw new Error("Could not compile Frame foundation reveal");
const imports = [
  ["openWindow", "windows"], ["getDirectory", "files"], ["settings", "settings"],
  ["registerShortcut", "shortcuts"], ["secureStorage", "secure-storage"], ["beforeQuit", "app"],
];
const reveal = [{ time: 0, x: 0, y: 15, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];
const boxReveal = [{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];
const hide = [{ time: 0, x: 0, y: 0, opacity: 1 }, { time: 380, x: 0, y: 0, opacity: 1 }, { time: 550, x: 0, y: 8, opacity: 0 }];
const boxGeometry = [{ x: 5, y: 5, width: 502, height: 96, radius: 28 }];
function FrameTitle({ icon }: { icon: string }) {
  return <MovingTitle style={{ height: 150, alignItems: "center", justifyContent: "center" }}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image source={{ uri: icon }} style={{ width: 140, height: 140 }} resizeMode="contain" />
      <Text style={{ color: "white", fontSize: 70, fontWeight: "600" }}>Legend Frame</Text>
    </View>
  </MovingTitle>;
}
export function FramePitch({ icon }: { icon: string }) {
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    <FrameTitle icon={icon} />
    <View style={{ marginTop: 50, alignSelf: "center" }}>
      {imports.map(([name, path], index) => <PlaybackKeyframeView key={path} keyframes={reveal} delay={index * 550} previewTime={5} clock="slide">
        <Text style={{ color: "white", fontFamily: "Menlo", fontSize: 27, marginBottom: 34 }}>
          {"import { "}<Text style={{ color: "#83dfff" }}>{name}</Text>{` } from "@legendapp/frame/${path}"`}
        </Text>
      </PlaybackKeyframeView>)}
    </View>
  </View>;
}
export const foundationBranchesShader = `
uniform float time;
${rootRibbonShader}
half4 main(float2 p) {
  float3 light=float3(0);
  for(int branch=0;branch<3;branch++) {
    float growth=smoothstep(0.5+float(branch)*1.5,1.2+float(branch)*1.5,time);
    float visible=step(0.001,growth);
    float start=branch==0?125.0:351.0+float(branch-1)*300.0;
    float end=255.0+float(branch)*300.0;
    float t=clamp((p.y-start)/(end-start),0.0,1.0);
    for(int strand=0;strand<4;strand++) {
      float lane=float(strand)-1.5;
      float x=848.0+sin(t*3.14159)*lane*12.0;
      float d=abs(p.x-x);
      float mask=step(start,p.y)*step(p.y,mix(start,end,growth))*visible;
      light=max(light,ribbon(p.x-x,3.5+sin(t*3.14159)*3.0,p.y,float(strand),float3(0.025,0.4,1))*mask);
      for(int spark=0;spark<3;spark++) {
        float u=fract(time*0.5+float(spark)/3.0+float(strand)*0.11);
        float2 pos=float2(848.0+sin(u*3.14159)*lane*12.0,mix(start,end,u));
        light+=float3(0.4,0.85,1)*exp(-length(p-pos)/2.0)*mask;
      }
      // Glints shed from the ribbons and drift outward before disappearing.
      for(int particle=0;particle<8;particle++) {
        float seed=float(particle)*0.23+float(strand)*0.17+float(branch)*0.31;
        float age=fract(time*0.65+seed);
        float source=fract(seed*3.71);
        float direction=mod(float(particle+strand),2.0)<0.5?-1.0:1.0;
        float2 origin=float2(848.0+sin(source*3.14159)*lane*12.0,mix(start,end,source));
        float2 point=origin+float2(direction*age*(35.0+float(particle)*8.0),age*18.0);
        float d=length(p-point);
        float size=0.7+mod(float(particle),4.0)*0.45;
        float fade=sin(age*3.14159)*(1.0-age)*visible*step(source,growth);
        light+=float3(0.45,0.85,1)*(exp(-d/size)+0.12*exp(-d/(size*4.0)))*fade;
      }
    }
  }
  float a=clamp(max(light.r,max(light.g,light.b)),0.0,1.0);
  return half4(min(light,float3(a)),a);
}`;
const branches = Skia.RuntimeEffect.Make(foundationBranchesShader);
if (!branches) throw new Error("Could not compile Frame foundation branches");
function FoundationBox({ title }: { title: string }) {
  return <View style={{ width: 512, height: 106, alignItems: "center", justifyContent: "center" }}>
    <GlassPanels panels={boxGeometry} width={512} height={106} />
    <Text style={{ color: "white", fontSize: 40, fontWeight: "600" }}>{title}</Text>
  </View>;
}
export function FrameFoundations({ icon }: { icon: string }) {
  const step = usePresentationValue("stepIndex");
  const branchUniforms = useAnimatedShaderUniforms({}, 5);
  const uniforms = useAnimatedShaderUniforms({ panelHalfHeight: 8, resolveToCheck: 0, broken: 1, settled: 0, phase: 0, centerX: 848 }, 6, { clock: 1 });
  return <View style={{ width: 1696, height: 980, alignSelf: "center" }}>
    <FrameTitle icon={icon} />
    <Canvas style={{ position: "absolute", inset: 0 }}><Fill><Shader source={branches!} uniforms={branchUniforms} /></Fill></Canvas>
    {["Expo Desktop", "Expo"].map((name, i) => <PlaybackKeyframeView key={name} keyframes={boxReveal} delay={1200 + i * 1500} previewTime={10} clock="slide" style={{ position: "absolute", left: 592, top: 250 + i * 300 }}>
      <FoundationBox title={name} />
    </PlaybackKeyframeView>)}
    {step === 0 && <PlaybackKeyframeView keyframes={boxReveal} delay={4200} previewTime={10} clock="slide" style={{ position: "absolute", left: 592, top: 850 }}>
      <FoundationBox title="WebView" />
    </PlaybackKeyframeView>}
    {step > 0 && <>
    <PlaybackKeyframeView keyframes={[{ time: 0, x: 0, y: 0, opacity: 1 }]} delay={0} previewTime={6} clock="step" style={{ position: "absolute", left: 0, top: 603, width: 1696, height: 1080 }}>
      <Canvas style={{ width: 1696, height: 1080 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
    </PlaybackKeyframeView>
    <PlaybackKeyframeView keyframes={hide} delay={0} previewTime={6} clock="step" style={{ position: "absolute", left: 592, top: 875, width: 512 }}><Text style={{ textAlign: "center", fontSize: 40, fontWeight: "600", color: "white" }}>WebView</Text></PlaybackKeyframeView>
    <PlaybackKeyframeView keyframes={boxReveal} delay={1500} previewTime={6} clock="step" style={{ position: "absolute", left: 592, top: 850 }}>
      <FoundationBox title="React Native" />
    </PlaybackKeyframeView>
    </>}
  </View>;
}
