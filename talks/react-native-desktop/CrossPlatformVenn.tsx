import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// Five overlapping platform circles, animated entirely by the shared GPU clock.
export const crossPlatformShader = `
uniform float time;
half4 main(float2 p) {
  p.x=848.0+(p.x-848.0)/1.7;
  float4 result=float4(0);
  for(int i=0;i<5;i++) {
    float angle=-1.5707963+float(i)*1.2566371;
    float2 center=float2(848,355)+float2(cos(angle),sin(angle))*128.0;
    float2 delta=p-center;
    float theta=atan(delta.y,delta.x);
    float radius=205.0+2.0*sin(theta*3.0+time*0.55+float(i));
    float d=length(delta)-radius;
    float inside=1.0-smoothstep(-0.8,0.8,d);
    float rim=exp(-abs(d+1.5)*0.65);
    float halo=exp(-max(d,0.0)*0.09)*(1.0-inside)*0.16;
    float light=0.55+0.45*cos(theta+2.0+0.12*sin(time*0.4));
    float3 tint=i==0 ? float3(0.15,0.40,0.58)
      : i==1 ? float3(0.13,0.43,0.37)
      : i==2 ? float3(0.20,0.31,0.57)
      : i==3 ? float3(0.37,0.25,0.52) : float3(0.27,0.40,0.51);
    float alpha=inside*0.60+halo;
    float3 color=tint*inside*0.60+float3(0.58,0.85,1.0)*(rim*light*0.45+halo);
    float4 bubble=float4(min(color,float3(alpha)),alpha);
    result=bubble+result*(1.0-bubble.a);
  }
  return half4(result);
}`;
const effect = Skia.RuntimeEffect.Make(crossPlatformShader);
if (!effect) throw new Error("Could not compile cross-platform Venn diagram");
const platforms = [
  { name: "iOS", x: 848, y: 83 },
  { name: "Android", x: 1110, y: 269 },
  { name: "Web", x: 1004, y: 579 },
  { name: "Windows", x: 692, y: 579 },
  { name: "macOS", x: 586, y: 269 },
];

// Coordinates are in the shader's logical space; widen both glass and labels together.
const screenX = (x: number) => 848 + (x - 848) * 1.7;
const frameworks = [
  { name: "React Native", x: 848, y: 320 },
  { name: "Flutter", x: 848, y: 361 },
  { name: "Compose", x: 848, y: 402 },
  { name: "Tauri", x: 800, y: 263 },
  { name: "SwiftUI", x: 705, y: 230 },
  { name: "AppKit", x: 580, y: 340 },
  { name: "Electron", x: 708, y: 393 },
  { name: "GPUI", x: 708, y: 434 },
  { name: "Deno", x: 708, y: 475 },
];

export function CrossPlatformVenn() {
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <View accessibilityLabel="Cross platform: React Native, Flutter, and Compose support all five platforms; Tauri supports mobile and desktop; SwiftUI supports iOS and macOS; AppKit supports macOS; Electron, GPUI, and Deno support macOS and Windows" style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 16 }}>
    <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
    </Canvas>
    {platforms.map(platform => <View key={platform.name} style={{ position: "absolute", left: screenX(platform.x) - 108, top: platform.y - 27, width: 216, height: 54, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#ffffff", fontSize: 36, fontWeight: "600", textShadowColor: "#0b1729", textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }}>{platform.name}</Text>
    </View>)}
    {frameworks.map(framework => <View key={framework.name} style={{ position: "absolute", left: screenX(framework.x) - 110, top: framework.y - 20, width: 220, height: 40, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: framework.name === "React Native" ? "#8de4ff" : "#ffffff", fontSize: 29, lineHeight: 36, fontWeight: framework.name === "React Native" ? "700" : "500", textAlign: "center", textShadowColor: "#082232", textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } }}>{framework.name}</Text>
    </View>)}
  </View>;
}
