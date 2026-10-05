import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { useState } from "react";
import { Text, View } from "react-native";
import { GlassPanels } from "../GlassPanels";
import { branchMaterialShader } from "../BranchMaterial";

const rows = [
  ["React Native", "TypeScript"],
  ["Electron", "TypeScript"],
  ["Deno", "TypeScript"],
  ["Tauri", "TypeScript + Rust"],
  ["GPUI", "Rust"],
  ["AppKit", "Swift / Objective-C"],
  ["SwiftUI", "Swift"],
  ["Flutter", "Dart"],
  ["Compose", "Kotlin"],
];
const tauriTop = 102 + rows.findIndex(([name]) => name === "Tauri") * 73;
const tablePanels = [{ x: 18, y: 16, width: 1660, height: 742, radius: 28 }];
const focusPanels = [
  { x: 90, y: 220, width: 570, height: 390, radius: 32 },
  { x: 1036, y: 220, width: 570, height: 390, radius: 32 },
];
const flowEffect = Skia.RuntimeEffect.Make(`
uniform float time;
uniform float stepIndex;
uniform float stepTime;
${branchMaterialShader}
float2 route(float t,float lane) {
  return float2(mix(660.0,1036.0,t),415.0+sin(t*3.14159)*(lane-1.0)*46.0);
}
half4 main(float2 p) {
  float reveal=step(0.5,stepIndex)*smoothstep(0.3,1.1,stepTime);
  float3 c=float3(0);
  float t=clamp((p.x-660.0)/376.0,0.0,1.0);
  float ends=smoothstep(650.0,674.0,p.x)*(1.0-smoothstep(1022.0,1046.0,p.x));
  for(int lane=0;lane<3;lane++) {
    float l=float(lane);
    float d=p.y-route(t,l).y;
    c+=branchRibbon(d,t,l*2.1,time,float3(0.04,0.48,0.74),float3(0.5,0.9,1))*ends*0.55;
    for(int j=0;j<8;j++) {
      float phase=fract(max(0.0,stepTime-1.0)*(0.14+l*0.03)+float(j)/8.0+l*0.13);
      if(lane==1) { phase=1.0-phase; }
      float packetReveal=lane==1?smoothstep(2.0,2.4,stepTime):smoothstep(1.0,1.4,stepTime);
      float dist=length(p-route(phase,l));
      float radius=1.6+mod(float(j),3.0)*1.0;
      c+=float3(0.48,0.88,1)*(exp(-dist*dist/(radius*radius))+exp(-dist*0.17)*0.22)*packetReveal;
    }
  }
  c=min(c,float3(1))*reveal;
  return half4(c,max(c.r,max(c.g,c.b)));
}`);
if (!flowEffect) throw new Error("Could not compile language connection");
const textStyle = { color: "#f8fafc", fontSize: 38, lineHeight: 52 } as const;

// Measure each naturally laid-out label once; native poses move the same text
// from its table position to the center of its expanded panel.
function MovingLabel({ focused, label, color, center, sourceLeft = 78, title = false }: {
  focused: boolean; label: string; color: string; center: number; sourceLeft?: number; title?: boolean;
}) {
  const [bounds, setBounds] = useState({ x: 0, width: 0 });
  const style = { ...textStyle, fontWeight: title ? "600" as const : undefined };
  return <View style={{ alignSelf: "flex-start" }}
    onLayout={({ nativeEvent: { layout } }) => setBounds(previous =>
      previous.x === layout.x && previous.width === layout.width ? previous : { x: layout.x, width: layout.width })}>
    <SceneMotionView pose={{ x: focused ? center - sourceLeft - bounds.x - bounds.width / 2 : 0,
      y: focused ? (title ? 80 : 310) - tauriTop : 0,
      scaleX: focused ? (title ? 1.8 : 1.65) : 1, scaleY: focused ? (title ? 1.8 : 1.65) : 1 }}
    duration={850} style={{ alignSelf: "flex-start" }}>
    <Text style={style}>{label}</Text>
    <SceneMotionView pose={{ opacity: focused ? 1 : 0 }} duration={850}
      style={{ position: "absolute", inset: 0 }}>
      <Text style={{ ...style, color }}>{label}</Text>
    </SceneMotionView>
    </SceneMotionView>
  </View>;
}

export function FrameworkLanguages() {
  const focused = usePresentationValue("stepIndex") > 0;
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <View style={{ width: 1696, height: 780, marginTop: 24, alignSelf: "center" }}>
    <SceneMotionView pose={{ opacity: focused ? 0.07 : 1 }} duration={650} style={{ position: "absolute", inset: 0 }}>
      <GlassPanels panels={tablePanels} width={1696} height={780} pulse={0.001} edgeMotion={0.4} />
      <Text style={{ ...textStyle, position: "absolute", left: 78, top: 30, color: "#b7cde1", fontSize: 32 }}>Framework</Text>
      <Text style={{ ...textStyle, position: "absolute", left: 808, top: 30, color: "#b7cde1", fontSize: 32 }}>What you write</Text>
      <View style={{ position: "absolute", left: 762, top: 16, width: 1, height: 742, backgroundColor: "#8acfff40" }} />
      {rows.map(([name], i) => <View key={name} style={{ position: "absolute", left: 20, top: 92 + i * 73, width: 1656, height: 73,
        borderTopWidth: 1, borderColor: "#8acfff40" }} />)}
    </SceneMotionView>
    {rows.filter(([name]) => name !== "Tauri").map(([name, language]) => {
      const index = rows.findIndex(row => row[0] === name);
      return <SceneMotionView key={name} pose={{ opacity: focused ? 0.06 : 1 }} duration={550}
        style={{ position: "absolute", left: 78, top: 102 + index * 73, width: 1540, height: 52, flexDirection: "row" }}>
        <Text style={{ ...textStyle, width: 730, fontWeight: "600" }}>{name}</Text>
        <Text style={textStyle}>{language}</Text>
      </SceneMotionView>;
    })}
    <SceneMotionView pose={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0.88, scaleY: focused ? 1 : 0.12 }}
      duration={850} style={{ position: "absolute", inset: 0 }}>
      <GlassPanels panels={focusPanels} width={1696} height={780} pulse={0.003} edgeMotion={0.7} />
    </SceneMotionView>
    <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Fill><Shader source={flowEffect!} uniforms={uniforms} /></Fill>
    </Canvas>
    {/* Match the other rows' layout; only transforms change on expansion. */}
    <View style={{ position: "absolute", left: 78, top: tauriTop, width: 1540, height: 52, flexDirection: "row" }}>
      <View style={{ width: 730 }}>
        <MovingLabel focused={focused} label="Tauri" color="#f8fafc" center={848} title />
      </View>
      <View style={{ flexDirection: "row" }}>
        <MovingLabel focused={focused} label="TypeScript" color="#83ecff" center={375} sourceLeft={808} />
        <SceneMotionView pose={{ opacity: focused ? 0 : 1 }} duration={250}>
          <Text style={textStyle}> + </Text>
        </SceneMotionView>
        <MovingLabel focused={focused} label="Rust" color="#ffe0a0" center={1321} sourceLeft={808} />
      </View>
    </View>
    <SceneMotionView pose={{ opacity: focused ? 1 : 0 }} duration={850} style={{ position: "absolute", inset: 0 }}>
      {focusPanels.map((panel, index) => <View key={index} style={{ position: "absolute", left: panel.x, top: 406, width: panel.width, alignItems: "center" }}>
        <Text style={{ ...textStyle, color: "#c1d8eb", fontSize: 30 }}>{index === 0 ? "Frontend" : "Native backend"}</Text>
        {[280, 350, 220].map((width, line) => <View key={line} style={{ width, height: 7, marginTop: 24, borderRadius: 4, backgroundColor: line === 1 ? "#69dfff60" : "#91badb30" }} />)}
      </View>)}
    </SceneMotionView>
  </View>;
}
