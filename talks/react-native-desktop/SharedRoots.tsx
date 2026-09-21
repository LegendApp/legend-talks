import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";

const features = ["Multiple windows", "Native menus", "Files & folders", "Local data", "Keyboard shortcuts", "Drag & drop", "Notifications", "Audio & media", "System dialogs", "OS integration"];

// Analytic glass tubes: the shader varies their radius and lighting together.
// No geometry, React state or uniform arrays are rebuilt on animation frames.
export const rootRibbonShader = `
// A rounded ribbon has a dark translucent body, a refractive edge, and
// narrow highlights. Max-compositing preserves detail at branching junctions.
float3 ribbon(float distance, float radius, float along, float phase, float3 tint) {
  float n = distance / radius;
  float body = 1.0 - smoothstep(0.82, 1.08, abs(n));
  float edge = exp(-abs(abs(n) - 0.87) * radius * 0.85);
  float ridge = exp(-pow((n + 0.35) * 5.0, 2.0));
  float grain = pow(0.5 + 0.5 * sin(n * 9.0 + along * 0.016 + phase), 4.0);
  float wave = pow(0.5 + 0.5 * sin(along * 0.035 - time * 2.0 + phase), 6.0);
  float glow = exp(-abs(distance) / (radius * 1.8));
  return tint * (body * 0.42 + ridge * body * 0.85 + glow * 0.06)
    + float3(0.42, 0.82, 1.0) * (edge * 0.48 + grain * body * 0.16)
    + float3(0.3, 0.72, 1.0) * wave * body * 0.36;
}
`;

export const rootsShader = `
uniform float time;
${rootRibbonShader}
float ease(float t) { return t * t * (3.0 - 2.0 * t); }
half4 main(float2 p) {
  float x = p.x - 848.0;
  float y = p.y * (450.0 / 550.0);
  float3 color = float3(0);
  // Upright tips curve into wide shoulders, then gather into the trunk.
  if (y < 245.0) {
    float t = clamp((y - 12.0) / 222.0, 0.0, 1.0);
    for (int i = 0; i < 5; i++) {
      float endpoint = (float(i) - 2.0) * 314.0;
      float bend = ease(t);
      float center = endpoint * (1.0 - bend);
      float slope = -endpoint * 6.0 * t * (1.0 - t) / 222.0;
      float pulse = 0.5 + 0.5 * sin(time * 1.5 - t * 5.0 + float(i) * 0.4);
      float3 tint = mix(float3(0.025, 0.24, 0.95), float3(0.02, 0.62, 1.0), float(i) / 4.0);
      for (int strand = 0; strand < 3; strand++) {
        float phase = float(strand) * 2.094 + float(i) * 0.6;
        float offset = sin(t * 8.0 + phase) * sin(t * 3.14159) * 24.0;
        float d = (x - center - offset) / sqrt(1.0 + slope * slope);
        float radius = (3.0 + 17.0 * sin(t * 1.5708)) * (0.86 + pulse * 0.25);
        float fade = smoothstep(0.0, 12.0, y) * (1.0 - smoothstep(212.0, 245.0, y));
        color = max(color, ribbon(d, radius, y, phase, tint) * fade);
      }
      float tip = length(float2(x - endpoint, y - 12.0));
      color += float3(0.35, 0.75, 1.0) * (exp(-tip * 0.35) + exp(-tip * 0.07) * 0.13);
    }
  }
  // Overlapping, tapered glass ribbons form a sculptural braided body.
  if (y > 178.0 && y < 351.0) {
    float t = (y - 178.0) / 173.0;
    float fade = smoothstep(178.0, 218.0, y) * (1.0 - smoothstep(315.0, 351.0, y));
    for (int i = 0; i < 5; i++) {
      float phase = float(i) * 1.2566;
      float center = sin(t * 5.5 + phase) * (24.0 + 9.0 * sin(t * 3.14159));
      float pulse = 0.5 + 0.5 * sin(time * 1.5 - t * 3.0 + phase * 0.3);
      float depth = 0.65 + 0.35 * cos(t * 5.5 + phase);
      color = max(color, ribbon(x - center, 15.0 + pulse * 5.0, y, phase, float3(0.025, 0.4, 1.0)) * fade * depth);
    }
  }
  // Roots sweep outward and curl down to individual luminous endpoints.
  if (y > 298.0) {
    float t = clamp((y - 302.0) / 130.0, 0.0, 1.0);
    float fade = smoothstep(298.0, 324.0, y) * (1.0 - smoothstep(434.0, 448.0, y));
    for (int i = 0; i < 10; i++) {
      float endpoint = (float(i) - 4.5) * 161.0;
      float center = endpoint * ease(t);
      float slope = endpoint * 6.0 * t * (1.0 - t) / 130.0;
      float pulse = 0.5 + 0.5 * sin(time * 1.5 - t * 5.0 + float(i) * 0.3);
      for (int strand = 0; strand < 2; strand++) {
        float phase = float(i) * 0.7 + float(strand) * 3.14159;
        float offset = sin(t * 7.0 + phase) * sin(t * 3.14159) * 17.0;
        float d = (x - center - offset) / sqrt(1.0 + slope * slope);
        color = max(color, ribbon(d, (18.0 - 14.0 * t) * (0.87 + pulse * 0.25), y, phase, float3(0.025, 0.38, 1.0)) * fade);
      }
      float tip = length(float2(x - endpoint, y - 432.0));
      color += float3(0.18, 0.72, 1.0) * (exp(-tip * 0.4) + exp(-tip * 0.075) * 0.12);
    }
  }
  float alpha = clamp(max(max(color.r, color.g), color.b) * 1.3, 0.0, 0.98);
  return half4(min(color, float3(alpha)), alpha);
}`;
const effect = Skia.RuntimeEffect.Make(rootsShader);
if (!effect) throw new Error("Could not compile shared foundation roots");

function RootSculpture() {
  const uniforms = useAnimatedShaderUniforms({}, 2);
  return <Canvas style={{ width: 1696, height: 550 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>;
}

export function SharedRoots({ icons }: { icons: string[] }) {
  const names = ["Music", "Chat History", "Code", "Diff", "Markdown"];
  return <View style={{ width: 1696, height: 770, alignSelf: "center", marginTop: 8 }}>
    {names.map((name, index) => <View key={name} style={{ position: "absolute", left: 60 + index * 314, top: -8, width: 320, alignItems: "center", gap: 4 }}>
      {index === 0
        ? <Text accessibilityLabel="Music icon placeholder" style={{ color: "#c4a0ff", fontSize: 82, lineHeight: 96 }}>♫</Text>
        : <Image source={{ uri: icons[index - 1] }} style={{ width: 96, height: 96 }} />}
      <Text style={{ color: "#f8fafc", fontSize: 30, fontWeight: "600" }}>{name}</Text>
    </View>)}
    <View style={{ position: "absolute", left: 0, top: 128, width: 1696 }}>
      <RootSculpture />
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 48, rowGap: 12, marginTop: 8 }}>
        {features.map(feature => <Text key={feature} style={{ width: 320, color: "#f8fafc", fontSize: 27, fontWeight: "500", textAlign: "center" }}>{feature}</Text>)}
      </View>
    </View>
  </View>;
}
