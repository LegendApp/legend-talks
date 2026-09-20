import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, SceneMotionView, SharedElement, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";

const capabilities = ["Windows", "Native menus", "Keyboard shortcuts", "Files & folders", "Open / save dialogs",
  "Drag & drop", "Clipboard", "Notifications", "Tray / menu bar", "Media controls",
  "Deep links", "App lifecycle", "Preferences", "Permissions", "Updates"];
const nodes = capabilities.map((label, index) => ({
  label, wave: Math.floor(index / 5) + 1,
  x: index < 5 ? 154 : index < 10 ? 1542 : index < 13 ? 498 + (index - 10) * 350 : 648 + (index - 13) * 400,
  y: index < 10 ? 110 + (index % 5) * 112 : index < 13 ? 46 : 614,
}));
const networkSource = `
uniform float time;
uniform float stepTime;
uniform float stepIndex;
uniform float announce;
float box(float2 p,float2 size,float r) {
  float2 q=abs(p)-size+r;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;
}
float segment(float2 p,float2 a,float2 b) {
  float2 v=b-a;
  return length(p-a-v*clamp(dot(p-a,v)/max(dot(v,v),0.001),0.0,1.0));
}
half4 main(float2 p) {
  float3 light=float3(0);
  float alpha=0.0;
  float collapse=announce*smoothstep(0.15,1.25,time);
  float rebuild=announce*smoothstep(3.5,4.5,time);
  float2 hub=float2(848,330);
  ${nodes.map((n, i) => `{
    float progress=stepIndex>${n.wave}.0 ? 1.0 : stepIndex<${n.wave}.0 ? 0.0 : smoothstep(${((i % 5) * .10).toFixed(2)},${(.65 + (i % 5) * .10).toFixed(2)},stepTime);
    if(announce>0.5) progress=1.0;
    float2 destination=float2(${n.x}.0,${n.y}.0);
    float2 end=mix(hub,destination,progress*(1.0-collapse)+rebuild*0.72);
    float visibility=progress*(1.0-collapse)+rebuild*0.25;
    float d=segment(p,hub,end);
    float pulse=0.8+0.2*sin(time*2.0+${i}.0);
    float line=(exp(-d*0.20)*0.22+exp(-d*1.4)*0.8)*visibility;
    float panel=box(p-end,float2(145,36),17.0);
    float body=(1.0-smoothstep(-1.0,1.0,panel))*visibility;
    float rim=exp(-abs(panel)*1.2)*visibility;
    light+=float3(0.02,0.055,0.10)*body+float3(0.22,0.75,1.0)*(line+rim*0.55)*pulse;
    alpha=max(alpha,body*0.91);
    for(int j=0;j<3;j++) {
      float travel=fract(time*(0.65+${(i % 3 * .12).toFixed(2)})+float(j)/3.0+${(i * .17).toFixed(2)});
      float2 particle=mix(end,hub,travel);
      float size=2.0+float(j)*1.1;
      float spark=exp(-length(p-particle)/size)*visibility;
      light+=float3(0.5,0.86,1.0)*spark*(1.5+float(j));
    }
  }`).join("\n")}
  float flash=announce*exp(-pow((time-1.18)*8.0,2.0));
  light+=float3(0.55,0.88,1.0)*exp(-length(p-hub)*0.017)*flash*4.0;
  alpha=max(alpha,clamp(max(light.r,max(light.g,light.b)),0.0,1.0));
  return half4(min(light,float3(alpha)),alpha);
}`;
const networkEffect = Skia.RuntimeEffect.Make(networkSource);
if (!networkEffect) throw new Error("Could not compile desktop foundations network");

function Network({ announce = false }: { announce?: boolean }) {
  const uniforms = useAnimatedShaderUniforms({ announce: announce ? 1 : 0 }, 5);
  return <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
    <Fill><Shader source={networkEffect!} uniforms={uniforms} /></Fill>
  </Canvas>;
}
const appPanel = [{ x: 0, y: 0, width: 280, height: 166, radius: 24 }];
function AppWindow() {
  return <View style={{ width: 280, height: 166 }}>
    <GlassPanels panels={appPanel} width={280} height={166} />
    <View style={{ position: "absolute", left: 20, top: 18, flexDirection: "row", gap: 8 }}>
      {["#ff7a87", "#ffd37e", "#87ebbb"].map(color => <View key={color} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} />)}
    </View>
    <Text style={{ position: "absolute", top: 69, left: 0, right: 0, textAlign: "center", color: "#ffffff", fontSize: 32, fontWeight: "600" }}>Your app</Text>
  </View>;
}
const stage = { width: 1696, height: 680, marginTop: 36, alignSelf: "center" as const };
export function DesktopModulesChecklist() {
  const step = usePresentationValue("stepIndex");
  return <View style={stage}>
    <Network />
    {nodes.map((node, index) => {
      const current = step === node.wave;
      const shown = step >= node.wave;
      const x = node.x - 145, y = node.y - 36;
      return <PlaybackKeyframeView key={node.label} delay={current ? (index % 5) * 100 : 0}
        keyframes={Array.from({ length: 14 }, (_, sample) => {
          const t = sample / 13, eased = t * t * (3 - 2 * t);
          return { time: t * 650, x: current ? 703 + (x - 703) * eased : x,
            y: current ? 294 + (y - 294) * eased : y, opacity: current ? eased : shown ? 1 : 0 };
        })}
        style={{ position: "absolute", width: 290, height: 72, justifyContent: "center" }}>
        <Text style={{ textAlign: "center", color: "#f4fbff", fontSize: 27, fontWeight: "500" }}>{node.label}</Text>
      </PlaybackKeyframeView>;
    })}
    <SharedElement id="frame-app-window" style={{ position: "absolute", left: 708, top: 247 }}>
      <AppWindow />
    </SharedElement>
  </View>;
}

const shipping = ["Project setup & native linking", "Release builds & binary size", "Compatibility patches",
  "Signing & notarization", "Packaging & publishing", "Updates & release automation"];
const sheets = Array.from({ length: 12 }, (_, i) => ({ x: 620 + (i % 3) * 52, y: 140 + i * 19, width: 350, height: 210, radius: 14 }));
export function DesktopShipping() {
  return <View style={stage}>
    {sheets.map((sheet, i) => <PlaybackKeyframeView key={i} clock="slide" delay={i * 100}
      keyframes={[{ time: 0, x: (i % 2 ? -1 : 1) * 620, y: -180, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", left: sheet.x, top: sheet.y, width: 350, height: 210 }}>
      <GlassPanels panels={[{ ...sheet, x: 0, y: 0 }]} width={350} height={210} pulse={0.002} />
      <View style={{ position: "absolute", left: 22, top: 24, gap: 14 }}>
        {[210, 120, 250, 170, 95].map((width, line) => <View key={line} style={{ width, height: 4, borderRadius: 2, backgroundColor: line === 1 ? "#f5b879" : "#426078" }} />)}
      </View>
    </PlaybackKeyframeView>)}
    {shipping.map((label, i) => <PlaybackKeyframeView key={label} clock="slide" delay={350 + i * 170}
      keyframes={[{ time: 0, x: i < 3 ? -60 : 60, y: 18, opacity: 0 }, { time: 500, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", left: i < 3 ? 0 : 1166, top: 150 + (i % 3) * 145, width: 530 }}>
      <Text style={{ color: "#ffffff", fontSize: 31, textAlign: i < 3 ? "right" : "left" }}>{label}</Text>
    </PlaybackKeyframeView>)}
    <SharedElement id="frame-app-window" style={{ position: "absolute", left: 708, top: 247 }}><AppWindow /></SharedElement>
  </View>;
}

export function FrameAnnouncement() {
  return <View style={stage}>
    <Network announce />
    <SceneMotionView initialPose={{ opacity: 1, scaleX: 1, scaleY: 1 }}
      pose={{ opacity: 0, scaleX: 0.01, scaleY: 0.01 }} duration={1100}
      style={{ position: "absolute", inset: 0 }}>
      <GlassPanels panels={sheets} width={1696} height={680} />
    </SceneMotionView>
    <SceneMotionView initialPose={{ opacity: 1, scaleX: 1, scaleY: 1 }} pose={{ opacity: 0, scaleX: 0.02, scaleY: 0.02 }} duration={1100}
      style={{ position: "absolute", left: 708, top: 247 }}><AppWindow /></SceneMotionView>
    <PlaybackKeyframeView clock="slide" delay={1250}
      keyframes={[{ time: 0, x: 0, y: 30, opacity: 0 }, { time: 450, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", left: 0, right: 0, top: 273 }}>
      <Text style={{ textAlign: "center", color: "#c0f5ff", fontSize: 66, fontFamily: "Menlo", fontWeight: "600" }}>npx @legendapp/frame create</Text>
    </PlaybackKeyframeView>
    <PlaybackKeyframeView clock="slide" delay={2700}
      keyframes={[{ time: 0, x: 0, y: 20, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", left: 0, right: 0, top: 130 }}>
      <Text style={{ textAlign: "center", color: "#ffffff", fontSize: 86, fontWeight: "700" }}>Legend Frame</Text>
    </PlaybackKeyframeView>
    <PlaybackKeyframeView clock="slide" delay={3500}
      keyframes={[{ time: 0, x: 0, y: -90, opacity: 0 }, { time: 800, x: 0, y: 0, opacity: 1 }]}
      style={{ position: "absolute", left: 708, top: 435 }}><AppWindow /></PlaybackKeyframeView>
  </View>;
}
