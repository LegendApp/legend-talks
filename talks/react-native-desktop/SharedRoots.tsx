import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";

const features = ["Multiple windows", "Native menus", "Files & folders", "Local data", "Keyboard shortcuts", "Drag & drop", "Notifications", "Audio & media", "System dialogs", "OS integration"];

// Analytic glass tubes: the shader varies their radius and lighting together.
// No geometry, React state or uniform arrays are rebuilt on animation frames.
export const rootsShader = `
uniform float time;
float tube(float d, float radius) {
  float core = 1.0 - smoothstep(radius * 0.6, radius, abs(d));
  float rim = exp(-abs(abs(d) - radius * 0.78) * 1.8);
  float highlight = exp(-abs(d + radius * 0.34) * 2.1);
  float glow = exp(-abs(d) / (radius * 2.3));
  return core * 0.36 + rim * 0.38 + highlight * 0.62 + glow * 0.13;
}
half4 main(float2 p) {
  float2 q = float2((p.x - 848.0) / 2.0, p.y);
  float light = 0.0;
  float3 tint = float3(0.15, 0.66, 1.0);
  // Five broad branches share a braided trunk, with one endpoint per app.
  if (q.y < 208.0) {
    float t = clamp(q.y / 190.0, 0.0, 1.0);
    for (int i = 0; i < 5; i++) {
      float endpoint = (float(i) - 2.0) * 157.0;
      float center = endpoint * pow(1.0 - t, 1.9);
      float slope = -endpoint * 1.9 * pow(max(0.001, 1.0 - t), 0.9) / 190.0;
      float pulse = 0.5 + 0.5 * sin(time * 1.5 + t * 6.0 - float(i) * 0.35);
      float radius = (3.8 + 7.0 * t) * (0.82 + pulse * 0.32);
      for (int strand = 0; strand < 3; strand++) {
        float offset = sin(t * 9.0 + float(strand) * 2.094 + float(i)) * 7.0 * t;
        float d = (q.x - center - offset) / sqrt(1.0 + slope * slope);
        light += tube(d, radius) * (0.65 + 0.35 * pulse) * 0.42 * (1.0 - smoothstep(175.0, 208.0, q.y));
      }
    }
  }
  // A braided glass trunk gives the foundation a continuous physical body.
  if (q.y > 166.0 && q.y < 296.0) {
    float t = (q.y - 166.0) / 130.0;
    float fade = smoothstep(166.0, 193.0, q.y) * (1.0 - smoothstep(270.0, 296.0, q.y));
    for (int i = 0; i < 3; i++) {
      float center = sin(t * 7.0 + float(i) * 2.094) * 12.0;
      float pulse = 0.5 + 0.5 * sin(time * 1.5 + t * 3.0);
      light += tube(q.x - center, 10.0 + pulse * 2.5) * fade * (0.7 + pulse * 0.3);
    }
  }
  // Sculpted roots widen out from the trunk rather than starting as loose lines.
  if (q.y >= 258.0) {
    float t = clamp((q.y - 270.0) / 96.0, 0.0, 1.0);
    float fade = smoothstep(258.0, 290.0, q.y) * (1.0 - smoothstep(359.0, 378.0, q.y));
    for (int i = 0; i < 10; i++) {
      float endpoint = (float(i) - 4.5) * 78.0;
      float center = endpoint * t * t;
      float slope = endpoint * 2.0 * t / 96.0;
      float pulse = 0.5 + 0.5 * sin(time * 1.5 - t * 5.0 + float(i) * 0.22);
      float radius = (13.0 - 8.0 * t) * (0.83 + 0.3 * pulse);
      light += tube((q.x - center) / sqrt(1.0 + slope * slope), radius) * fade * (0.32 + pulse * 0.13);
    }
  }
  float foot = exp(-pow(q.y - 366.0, 2.0) / 100.0) * exp(-q.x * q.x / 75000.0);
  light += foot * 0.18;
  float alpha = clamp(light * 0.9, 0.0, 0.96);
  float3 color = mix(tint, float3(0.85, 0.97, 1.0), clamp(light * 0.43, 0.0, 0.8));
  return half4(color * alpha, alpha);
}`;
const effect = Skia.RuntimeEffect.Make(rootsShader);
if (!effect) throw new Error("Could not compile shared foundation roots");

function RootSculpture() {
  const uniforms = useAnimatedShaderUniforms({}, 2);
  return <Canvas style={{ width: 1696, height: 385 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>;
}

export function SharedRoots({ icons }: { icons: string[] }) {
  const step = usePresentationValue("stepIndex");
  const names = ["Music", "Chat History", "Code", "Diff", "Markdown"];
  return <View style={{ width: 1696, height: 710, alignSelf: "center", marginTop: 24 }}>
    {names.map((name, index) => <View key={name} style={{ position: "absolute", left: 60 + index * 314, top: 0, width: 320, alignItems: "center", gap: 8 }}>
      {index === 0
        ? <Text accessibilityLabel="Music icon placeholder" style={{ color: "#c4a0ff", fontSize: 94, lineHeight: 112 }}>♫</Text>
        : <Image source={{ uri: icons[index - 1] }} style={{ width: 112, height: 112 }} />}
      <Text style={{ color: "#f8fafc", fontSize: 30, fontWeight: "600" }}>{name}</Text>
    </View>)}
    <SceneMotionView hidden={step === 0} pose={{ opacity: step > 0 ? 1 : 0, y: step > 0 ? 0 : 16 }} duration={1000}
      style={{ position: "absolute", left: 0, top: 162, width: 1696 }}>
      {step > 0 && <RootSculpture />}
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 48, rowGap: 22, marginTop: 12 }}>
        {features.map(feature => <Text key={feature} style={{ width: 320, color: "#f8fafc", fontSize: 27, fontWeight: "500", textAlign: "center" }}>{feature}</Text>)}
      </View>
      <Text style={{ color: "#9ceaff", fontSize: 34, fontWeight: "600", textAlign: "center", marginTop: 20 }}>Shared native foundation</Text>
    </SceneMotionView>
  </View>;
}
