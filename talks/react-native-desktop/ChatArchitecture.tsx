import { Canvas, Fill, Path, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

const nodes = [
  { x: 155, y: 95, label: "Find chat files", icon: "M -20 -12 L -6 -12 L 0 -6 L 22 -6 L 22 18 L -20 18 Z" },
  { x: 155, y: 210, label: "Parse metadata", icon: "M -16 -21 L 17 -21 L 17 21 L -16 21 Z M -8 -10 L 9 -10 M -8 0 L 9 0 M -8 10 L 3 10" },
  { x: 155, y: 325, label: "Parse selected chat", icon: "M -21 -16 L 21 -16 L 21 12 L -4 12 L -15 23 L -15 12 L -21 12 Z M -10 -3 L 10 -3" },
  { x: 1055, y: 325, label: "LegendList", icon: "M -11 -17 L 22 -17 M -11 0 L 22 0 M -11 17 L 22 17 M -23 -17 L -19 -17 M -23 0 L -19 0 M -23 17 L -19 17" },
  { x: 155, y: 465, label: "Enriched Markdown", icon: "M -24 -17 L 24 -17 L 24 17 L -24 17 Z M -16 9 L -16 -8 L -8 1 L 0 -8 L 0 9 M 13 -9 L 13 9 M 7 3 L 13 9 L 19 3" },
  { x: 1055, y: 465, label: "App UI", icon: "M -22 -18 L 22 -18 L 22 18 L -22 18 Z M -22 -7 L 22 -7 M -15 -12 L -12 -12" },
  { x: 1055, y: 580, label: "Composer", icon: "M -21 20 L -16 5 L 13 -23 L 24 -12 L -5 16 Z M -16 5 L -5 16 M 7 -17 L 18 -6" },
  { x: 1055, y: 695, label: "Settings", icon: "M -22 -14 L 22 -14 M -22 0 L 22 0 M -22 14 L 22 14 M -10 -20 L -10 -8 M 10 -6 L 10 6 M -5 8 L -5 20" },
];
const panels = nodes.map(node => ({ x: node.x, y: node.y - 43, width: 485, height: 86, radius: 43 }));
const paths = [
  "M 395 138 L 395 167", "M 395 253 L 395 282", "M 640 325 L 1055 325",
  "M 1295 368 Q 1295 395 1255 395 L 435 395 Q 395 395 395 422",
  "M 640 465 L 1055 465", "M 1295 508 L 1295 537", "M 1295 623 L 1295 652",
];
// Light packets follow the same routes as the glass pipes, entirely on the GPU.
export const architectureParticlesShader = `
uniform float time;
uniform float stage;
float2 route(int i,float t) {
  if(i==0) return float2(395.0,mix(138.0,167.0,t));
  if(i==1) return float2(395.0,mix(253.0,282.0,t));
  if(i==2) return float2(mix(640.0,1055.0,t),325.0);
  if(i==3) {
    if(t<0.07) {float u=t/0.07;return float2(1295.0-40.0*u*u,368.0+27.0*(2.0*u-u*u));}
    if(t<0.93) return float2(mix(1255.0,435.0,(t-0.07)/0.86),395.0);
    float u=(t-0.93)/0.07;return float2(435.0-40.0*(2.0*u-u*u),395.0+27.0*u*u);
  }
  if(i==4) return float2(mix(640.0,1055.0,t),465.0);
  if(i==5) return float2(1295.0,mix(508.0,537.0,t));
  return float2(1295.0,mix(623.0,652.0,t));
}
half4 main(float2 p) {
  float3 c=float3(0);
  for(int i=0;i<7;i++) {
    if(float(i)<stage) {
      for(int j=0;j<5;j++) {
        float phase=fract(time*(i==3 ? 0.16 : i==2 || i==4 ? 0.25 : 0.5)+float(j)/5.0+float(i)*0.13);
        float2 delta=p-route(i,phase);
        float d=length(delta);
        float radius=1.4+mod(float(j),3.0)*0.65;
        c+=float3(0.55,0.88,1.0)*(exp(-d*d/(radius*radius))*0.95+exp(-d*0.23)*0.20);
      }
    }
  }
  c=min(c,float3(1));
  return half4(c,max(c.r,max(c.g,c.b)));
}`;
const effect = Skia.RuntimeEffect.Make(architectureParticlesShader);
if (!effect) throw new Error("Could not compile architecture particles");

export function ChatArchitecture() {
  const stage = Math.min(usePresentationValue("stepIndex"), 7);
  const uniforms = useAnimatedShaderUniforms({ stage }, 8);
  return <View accessibilityLabel="Native: find chat files, parse metadata, parse selected chat. React: LegendList virtualizes. Native: Enriched Markdown renders messages. React: app UI, composer, settings." style={{ width: 1696, height: 789, alignSelf: "center", marginTop: 24 }}>
    <Text style={{ position: "absolute", top: 0, left: 155, width: 485, textAlign: "center", color: "#b9dcff", fontSize: 43, fontWeight: "600" }}>Native</Text>
    <Text style={{ position: "absolute", top: 0, left: 1055, width: 485, textAlign: "center", color: "#8eeeff", fontSize: 43, fontWeight: "600" }}>React</Text>
    <View style={{ position: "absolute", left: 0, top: 24, width: 1696, height: 765 }}>
    <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      {paths.map((path, index) => <Path key={`halo-${index}`} path={path} style="stroke" strokeWidth={14} strokeCap="round" color={index < stage ? "#369be51e" : "#369be509"} />)}
      {paths.map((path, index) => <Path key={`pipe-${index}`} path={path} style="stroke" strokeWidth={6} strokeCap="round" color={index < stage ? "#438acb80" : "#28435b30"} />)}
      {paths.map((path, index) => <Path key={`rim-${index}`} path={path} style="stroke" strokeWidth={1.5} strokeCap="round" color={index < stage ? "#a0e7ff" : "#42607750"} />)}
      {["M 388 159 L 395 167 L 402 159", "M 388 274 L 395 282 L 402 274", "M 1045 317 L 1055 325 L 1045 333", "M 388 414 L 395 422 L 402 414", "M 1045 457 L 1055 465 L 1045 473", "M 1288 529 L 1295 537 L 1302 529", "M 1288 644 L 1295 652 L 1302 644"].map((path, index) => <Path key={`arrow-${index}`} path={path} style="stroke" strokeWidth={2.5} strokeCap="round" strokeJoin="round" color={index < stage ? "#b8eeff" : "#42607750"} />)}
      <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
    </Canvas>
    <GlassPanels panels={panels} width={1696} height={765} pulse={0.004} edgeMotion={0.5} />
    {nodes.map((node, index) => {
      const react = node.x > 848;
      const color = react ? "#70eaff" : "#a4d3ff";
      return <SceneMotionView key={node.label} pose={{ opacity: index <= stage ? 1 : 0.18 }} duration={450} style={{ position: "absolute", left: node.x, top: node.y - 43, width: 485, height: 86 }}>
        <View style={{ position: "absolute", left: 12, top: 8, width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: color, backgroundColor: react ? "#124757" : "#183b60", shadowColor: color, shadowOpacity: 0.65, shadowRadius: 13, shadowOffset: { width: 0, height: 0 }, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 39, fontWeight: "600" }}>{index + 1}</Text>
        </View>
        <Canvas pointerEvents="none" style={{ position: "absolute", left: 94, top: 13, width: 60, height: 60 }}>
          <Path path={node.icon} transform={[{ translateX: 30 }, { translateY: 30 }]} style="stroke" strokeWidth={2.8} strokeCap="round" strokeJoin="round" color={color} />
        </Canvas>
        <View style={{ position: "absolute", left: 168, top: 0, right: 10, height: 86, justifyContent: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 28, lineHeight: 35, fontWeight: "600" }}>{node.label}</Text>
        </View>
      </SceneMotionView>;
    })}
    </View>
  </View>;
}
