import { Canvas, Fill, Path, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Text, View } from "react-native";

import { frameworkCoverage, platforms } from "../FrameworkCoverage";

const order = ["React Native", "Flutter", "Compose", "Tauri", "SwiftUI", "AppKit", "Electron", "GPUI", "Deno"];
const frameworks = order.map(name => frameworkCoverage.find(framework => framework.name === name)!);
// Static coverage predicates; shader motion stays entirely on the GPU.
const support = frameworks.map((framework, row) =>
  `if(row==${row}) { ${framework.coverage.map((value, column) => `if(column==${column}) return ${value.toFixed(1)};`).join(" ")} }`
).join("\n");
export const crossPlatformShader = `
uniform float time;
float supported(int row,int column) { ${support} return 0.0; }
float hash(float n) { return fract(sin(n*127.1)*43758.5453); }
half4 main(float2 p) {
  float3 color=float3(0);
  // Only evaluate the nearest lane: particle cost does not grow with row count.
  int row=int(clamp(floor((p.y-130.0)/64.0+0.5),0.0,8.0));
  float y=130.0+float(row)*64.0;
  float dy=abs(p.y-y);
  float3 tint=row==0 ? float3(0.20,0.86,1.0) : float3(0.57,0.73,1.0);
  float first=row>=5 ? 990.0 : 470.0;
  float last=row<3 ? 1510.0 : row==3 ? 1250.0 : row<6 ? 990.0 : 1250.0;
  float span=step(first,p.x)*step(p.x,last);
  bool partialWeb=row==3 || row==6 || row==8;
  float laneEnd=partialWeb ? 1510.0 : last;
  span=step(first,p.x)*step(p.x,laneEnd);
  int nearestColumn=int(clamp(floor((p.x-470.0)/260.0+0.5),0.0,4.0));
  float laneCoverage=supported(row,nearestColumn);
  bool partialLane=laneCoverage>0.0 && laneCoverage<1.0;
  float3 partialTint=float3(1.0,0.76,0.12);
  float3 laneTint=partialLane ? partialTint : tint;
  if(partialLane) span*=step(0.5,fract(p.x/18.0))*0.75;
  float wave=pow(0.5+0.5*sin(time*2.1-p.x*0.008+float(row)*0.7),5.0);
  color+=laneTint*(exp(-dy*1.4)*0.60+exp(-dy*0.16)*(0.08+wave*0.17))*span;
  float travel=fract(time*0.19+float(row)*0.137);
  float pulseX=mix(first,laneEnd,travel);
  float trail=exp(-abs(p.x-pulseX)*0.034)*span;
  color+=laneTint*trail*(exp(-dy*0.22)*0.65+exp(-dy*1.1));
  for(int column=0;column<5;column++) {
    float x=470.0+float(column)*260.0;
    color+=float3(0.12,0.22,0.32)*exp(-abs(p.x-x)*1.2)*step(88.0,p.y)*step(p.y,662.0)*0.55;
    float coverage=supported(row,column);
    if(coverage>0.0) {
      float3 nodeTint=coverage<1.0 ? partialTint : tint;
      float phase=time*2.2+float(column)*0.9-float(row)*0.6;
      float beat=0.15+0.1*sin(phase);
      float radius=7.0+beat*1.8;
      float d=length(p-float2(x,y));
      color+=nodeTint*exp(-d*0.075)*(0.34+beat*0.36);
      if(coverage==1.0) color+=float3(0.85,0.95,1.0)*(1.0-smoothstep(radius-1.0,radius+0.8,d));
      else {
        // Clear the lane/glow inside partial markers so they remain hollow.
        color*=smoothstep(radius-2.5,radius-1.0,d);
        color+=nodeTint*exp(-abs(d-radius)*1.5)*1.5;
      }
      float ring=14.0+fract(phase/6.28318)*13.0;
      color+=nodeTint*exp(-abs(d-ring)*1.1)*(1.0-fract(phase/6.28318))*0.35;
      for(int spark=0;spark<5;spark++) {
        float seed=float(row*31+column*7+spark);
        float life=fract(time*(0.30+hash(seed)*0.22)+hash(seed+4.0));
        float angle=hash(seed+9.0)*6.28318;
        float2 offset=float2(cos(angle)*46.0,sin(angle)*23.0)*life;
        float2 delta=p-float2(x,y)-offset;
        float size=mix(0.65,2.0,hash(seed+13.0));
        float sparkLight=exp(-dot(delta,delta)/(size*size*2.0))*sin(life*3.14159);
        color+=mix(nodeTint,coverage<1.0 ? float3(1.0,0.93,0.52) : float3(1),hash(seed+6.0))*sparkLight*1.25;
      }
    }
  }
  color*=smoothstep(float(row)*0.20,float(row)*0.20+0.75,time);
  color=1.0-exp(-color*1.3);
  float alpha=max(color.r,max(color.g,color.b));
  return half4(color,alpha);
}`;
const effect = Skia.RuntimeEffect.Make(crossPlatformShader);
if (!effect) throw new Error("Could not compile cross-platform lanes");

// Small device silhouettes above the platform names, drawn with crisp native paths.
const icons = [
  "M -12 -23 L 12 -23 Q 16 -23 16 -19 L 16 19 Q 16 23 12 23 L -12 23 Q -16 23 -16 19 L -16 -19 Q -16 -23 -12 -23 Z M -5 -17 L 5 -17 M -4 17 L 4 17",
  "M -18 0 Q -18 -19 0 -19 Q 18 -19 18 0 Z M -12 -17 L -18 -26 M 12 -17 L 18 -26 M -9 -8 L -9 -5 M 9 -8 L 9 -5 M -18 5 L -18 20 L 18 20 L 18 5 M -10 20 L -10 27 M 10 20 L 10 27",
  "M -25 -20 L 25 -20 L 25 13 L -25 13 Z M -8 13 L -8 23 M 8 13 L 8 23 M -16 23 L 16 23",
  "M -23 -19 L -3 -22 L -3 -2 L -23 -2 Z M 3 -23 L 24 -26 L 24 -2 L 3 -2 Z M -23 4 L -3 4 L -3 24 L -23 21 Z M 3 4 L 24 4 L 24 28 L 3 25 Z",
  "M 24 0 A 24 24 0 1 0 -24 0 A 24 24 0 1 0 24 0 M 0 -24 C -17 -12 -17 12 0 24 C 17 12 17 -12 0 -24 M -23 -8 L 23 -8 M -23 8 L 23 8",
];

export function CrossPlatformLanes() {
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <View accessibilityLabel={frameworks.map(framework => `${framework.name}: ${framework.coverage.map((value, target) => value ? `${platforms[target]}${value === 0.5 ? target === 4 ? " (reusable web UI)" : " (qualified mobile experience assessment)" : ""}` : null).filter(Boolean).join(", ")}`).join(". ")} style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 16 }}>
    <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
      {icons.map((path, column) => <Path key={platforms[column]} path={path} transform={[{ translateX: 470 + column * 260 }, { translateY: 30 }]} style="stroke" strokeWidth={2.5} strokeJoin="round" strokeCap="round" color="#e5f3ff" />)}
    </Canvas>
    {platforms.map((name, column) => <Text key={name} style={{ position: "absolute", left: 370 + column * 260, top: 68, width: 200, textAlign: "center", color: "#e5edf7", fontSize: 27, lineHeight: 34 }}>{name}</Text>)}
    {frameworks.map((framework, row) => <Text key={framework.name} style={{ position: "absolute", left: 32, top: 110 + row * 64, width: 320, color: row === 0 ? "#8de4ff" : "#f1f5f9", fontSize: 34, lineHeight: 40, fontWeight: row === 0 ? "700" : "500" }}>{framework.name}</Text>)}
  </View>;
}
