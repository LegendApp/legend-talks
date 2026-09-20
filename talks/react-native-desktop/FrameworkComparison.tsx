import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { ChartBar } from "./ChartBar";
import { frameworkCoverage, platforms } from "./FrameworkCoverage";
import benchmarks from "./rnconnection-assets/benchmarks.json";

// Equal-weight geometric mean of best/value for first content, switching and
// initial memory. Deno uses the mean of its two backend scores, not cherry-picked metrics.
const scoreMetrics = ["content", "switch", "memory"] as const;
const best = scoreMetrics.map(metric => Math.min(...benchmarks.chat.map(row => row[metric])));
const score = (row: typeof benchmarks.chat[number]) =>
  Math.pow(scoreMetrics.reduce((product, metric, index) => product * best[index] / row[metric], 1), 1 / 3);
const rows = frameworkCoverage.map(framework => {
  const samples = benchmarks.chat.filter(row => framework.name === "Deno" ? row.name.startsWith("Deno") : row.name === framework.name);
  if (!samples.length) throw new Error(`Missing benchmark for ${framework.name}`);
  return { ...framework, score: samples.reduce((sum, row) => sum + score(row), 0) / samples.length };
});

export const comparisonGlassShader = `
uniform float time;
float box(float2 p,float2 halfSize,float radius) {
  float2 q=abs(p)-halfSize+radius;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
}
half4 main(float2 p) {
  float4 result=float4(0);
  for(int panel=0;panel<3;panel++) {
    float x=panel==0 ? 510.0 : panel==1 ? 920.0 : 1390.0;
    float width=panel==0 ? 480.0 : panel==1 ? 290.0 : 590.0;
    float2 q=p-float2(x,420);
    float d=box(q,float2(width*0.5,392),24.0);
    float mask=1.0-smoothstep(-0.7,0.7,d);
    float breath=0.5+0.5*sin(time*0.9+float(panel)*0.85);
    float rim=exp(-abs(d+1.8)*0.7);
    float halo=exp(-abs(d)*0.10);
    float sweep=exp(-pow((q.y+q.x*0.55-460.0*sin(time*0.20+float(panel)*1.2))/48.0,2.0));
    float3 tint=float3(0.045,0.085,0.135);
    float3 color=tint*mask+float3(0.48,0.77,1.0)*rim*(0.38+breath*0.18)
      +float3(0.14,0.35,0.55)*halo*0.13
      +float3(0.16,0.28,0.4)*sweep*mask*0.12;
    float alpha=clamp(mask*0.88+halo*0.15,0.0,1.0);
    float4 layer=float4(min(color,float3(alpha)),alpha);
    result=layer+result*(1.0-layer.a);
  }
  return half4(result);
}`;
const effect = Skia.RuntimeEffect.Make(comparisonGlassShader);
if (!effect) throw new Error("Could not compile comparison glass");

export function FrameworkComparison() {
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <View accessibilityLabel="Framework comparison: performance index, native content controls, and platform coverage. Half-filled Web dots mean reusable web UI; Tauri mobile half dots reflect the presenter’s assessment of the experience." style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
    {[{ name: "Performance", x: 270, width: 480 }, { name: "Native UI", x: 775, width: 290 }, { name: "Cross platform", x: 1095, width: 590 }].map(column =>
      <Text key={column.name} style={{ position: "absolute", left: column.x, top: 64, width: column.width, fontSize: 36, lineHeight: 44, fontWeight: "600", color: "#f1f5f9", textAlign: "center" }}>{column.name}</Text>)}
    {platforms.map((platform, index) => <Text key={platform} style={{ position: "absolute", left: 1118 + index * 110, top: 124, width: 105, textAlign: "center", color: "#b8c2ce", fontSize: 23 }}>{platform}</Text>)}
    {rows.map((row, index) => {
      const highlighted = row.name === "React Native";
      const y = 200 + index * 66;
      return <View key={row.name} accessibilityLabel={`${row.name}: performance index ${Math.round(row.score * 100)}, native UI ${row.native ? "yes" : "no"}, ${row.coverage.filter(value => value === 1).length} platforms${row.coverage.includes(0.5) ? ` plus ${row.coverage.filter(value => value === 0.5).length} qualified targets` : ""}`} style={{ position: "absolute", left: 0, top: y - 29, width: 1696, height: 58, justifyContent: "center" }}>
        {highlighted && <View style={{ position: "absolute", inset: 0, borderRadius: 14, borderWidth: 1, borderColor: "#65cde880", backgroundColor: "#20608035" }} />}
        <Text style={{ width: 266, paddingLeft: 12, color: highlighted ? "#8de4ff" : "#f1f5f9", fontSize: 32, lineHeight: 40, fontWeight: highlighted ? "700" : "500" }}>{row.name}</Text>
        <View style={{ position: "absolute", left: 294, top: 15, width: 432, height: 28, borderRadius: 6, backgroundColor: "#90b6db16" }}>
          <ChartBar highlighted={highlighted} style={{ width: 432 * row.score, height: 28 }} />
        </View>
        <Text style={{ position: "absolute", left: 775, width: 290, textAlign: "center", fontSize: 42, lineHeight: 52, color: row.native ? highlighted ? "#7ce8f7" : "#e7f5ff" : "#778ea6" }}>{row.native ? "✓" : "–"}</Text>
        {row.coverage.map((value, column) => <View key={column} style={{ position: "absolute", left: 1156 + column * 110, top: 14, width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: value ? "#d4efff" : "#506b82", backgroundColor: value === 1 ? highlighted ? "#71e3fa" : "#c2e5ff" : "transparent", overflow: "hidden" }}>
          {value === 0.5 && <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, backgroundColor: "#c2e5ff" }} />}
        </View>)}
      </View>;
    })}
  </View>;
}
