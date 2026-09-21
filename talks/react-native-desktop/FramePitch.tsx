import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";
import { MovingTitle } from "./MovingTitle";
import { objectionGlassShader } from "./DesktopObjections";

const effect = Skia.RuntimeEffect.Make(objectionGlassShader);
if (!effect) throw new Error("Could not compile Frame foundation reveal");
const imports = [
  ["openWindow", "windows"], ["getDirectory", "files"], ["settings", "settings"],
  ["registerShortcut", "shortcuts"], ["secureStorage", "secure-storage"], ["beforeQuit", "app"],
];
const reveal = [{ time: 0, x: 0, y: 15, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];
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
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    <FrameTitle icon={icon} />
    <View style={{ marginTop: 50, alignSelf: "center" }}>
      {imports.map(([name, path], index) => <SceneMotionView key={path} pose={{ opacity: step >= index ? 1 : 0, y: step >= index ? 0 : 20 }} duration={500}>
        <Text style={{ color: "white", fontFamily: "Menlo", fontSize: 27, marginBottom: 34 }}>
          {"import { "}<Text style={{ color: "#83dfff" }}>{name}</Text>{` } from "@legendapp/frame/${path}"`}
        </Text>
      </SceneMotionView>)}
    </View>
  </View>;
}
export const foundationBranchesShader = `
uniform float time;
uniform float stepTime;
uniform float stepIndex;
half4 main(float2 p) {
  float3 light=float3(0);
  for(int branch=0;branch<3;branch++) {
    float visible=stepIndex>float(branch)?1.0:0.0;
    float growth=stepIndex==float(branch+1)?smoothstep(0.0,0.7,stepTime):1.0;
    float start=branch==0?125.0:276.0+float(branch-1)*160.0;
    float end=180.0+float(branch)*160.0;
    float t=clamp((p.y-start)/(end-start),0.0,1.0);
    for(int strand=0;strand<7;strand++) {
      float lane=float(strand)-3.0;
      float x=848.0+sin(t*3.14159)*lane*12.0;
      float d=abs(p.x-x);
      float mask=step(start,p.y)*step(p.y,mix(start,end,growth))*visible;
      light+=float3(0.08,0.4,0.65)*exp(-d/4.0)*mask*0.2;
      light+=float3(0.25,0.75,1)*exp(-d/0.8)*mask*0.5;
      for(int spark=0;spark<3;spark++) {
        float u=fract(time*0.5+float(spark)/3.0+float(strand)*0.11);
        float2 pos=float2(848.0+sin(u*3.14159)*lane*12.0,mix(start,end,u));
        light+=float3(0.4,0.85,1)*exp(-length(p-pos)/2.0)*mask;
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
  const branchUniforms = useAnimatedShaderUniforms({}, 3);
  const uniforms = useAnimatedShaderUniforms({ panelHalfHeight: 8, resolveToCheck: 0, broken: step >= 4 ? 1 : 0, settled: 0, phase: 0, centerX: 848 }, step >= 4 ? 3 : 0, { clock: 4 });
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    <FrameTitle icon={icon} />
    <Canvas style={{ position: "absolute", inset: 0 }}><Fill><Shader source={branches!} uniforms={branchUniforms} /></Fill></Canvas>
    {["Expo Desktop", "Expo"].map((name, i) => <SceneMotionView key={name} pose={{ opacity: step > i ? 1 : 0, y: step > i ? 0 : -15 }} duration={700} style={{ position: "absolute", left: 592, top: 175 + i * 160 }}>
      <FoundationBox title={name} />
    </SceneMotionView>)}
    {step >= 3 && <>
      {step >= 4 && <Canvas style={{ position: "absolute", left: 0, top: 248, width: 1696, height: 1080 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>}
      {step === 3 ? <View style={{ position: "absolute", left: 592, top: 495 }}><FoundationBox title="WebView" /></View>
        : <PlaybackKeyframeView keyframes={hide} previewTime={3} style={{ position: "absolute", left: 592, top: 520, width: 512 }}><Text style={{ textAlign: "center", fontSize: 40, fontWeight: "600", color: "white" }}>WebView</Text></PlaybackKeyframeView>}
    </>}
    {step >= 4 && <PlaybackKeyframeView keyframes={reveal} delay={1500} previewTime={3} style={{ position: "absolute", left: 592, top: 495 }}>
      <FoundationBox title="React Native" />
    </PlaybackKeyframeView>}
  </View>;
}
