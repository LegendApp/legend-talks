import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { useMemo } from "react";

export type GlassPanelShape = { x: number; y: number; width: number; height: number; radius?: number };

// Analytic lighting, not backdrop capture: one GPU surface for a group of panels.
// Circle/bubble shapes use equal width/height and radius = width / 2.
export const glassPanelMaterial = `
float glassBox(float2 p,float2 size,float radius) {
  float2 q=abs(p)-size+radius;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
}
float4 glassPanel(float2 p,float2 size,float radius,float clock) {
  float breath=0.5+0.5*sin(clock*0.85);
  float angle=atan(p.y,p.x);
  float2 breathingSize=size*(1.0+pulse*(breath-0.5));
  float d=glassBox(p,breathingSize,radius);
  d+=edgeMotion*(0.65*sin(angle*3.0+clock*0.45)+0.35*sin(angle*5.0-clock*0.3));
  float mask=1.0-smoothstep(-0.8,0.8,d);
  float2 uv=p/size;
  float edge=exp(-abs(d+1.2)*1.1);
  float bevel=exp(-abs(d+5.5)*0.22);
  float inner=exp(-abs(d+14.0)*0.10);
  float outside=exp(-max(d,0.0)*0.11)*(1.0-mask);
  float direction=0.42+0.58*pow(0.5+0.5*cos(atan(p.y,p.x)*2.0-0.6),2.0);
  float top=exp(-pow((uv.y+0.95)/0.24,2.0));
  float bottom=exp(-pow((uv.y-0.94)/0.18,2.0));
  float sweepAxis=(uv.y+uv.x*0.42+0.6*sin(clock*0.23))/0.26;
  float sweep=exp(-sweepAxis*sweepAxis);
  float3 body=float3(0.035,0.067,0.11)
    +float3(0.09,0.17,0.26)*top
    +float3(0.055,0.10,0.16)*bottom
    +float3(0.024,0.040,0.060)*sweep;
  float3 color=body*mask
    +float3(0.75,0.88,1.0)*edge*(0.60+breath*0.13)*direction
    +float3(0.24,0.48,0.72)*bevel*mask*(0.40+top*0.4)
    +float3(0.12,0.23,0.38)*inner*mask*0.30
    +float3(0.18,0.40,0.65)*outside*(0.14+breath*0.04);
  float alpha=clamp(mask*0.94+outside*0.30,0.0,1.0);
  return float4(min(color,float3(alpha)),alpha);
}`;

export function createGlassPanelsShader(panels: readonly GlassPanelShape[]) {
  const number = (value: number) => value.toFixed(3);
  return `uniform float time;\nuniform float pulse;\nuniform float edgeMotion;\n${glassPanelMaterial}\nhalf4 main(float2 p) { float4 result=float4(0);\n${panels.map((panel, index) => `{
    float4 layer=glassPanel(p-float2(${number(panel.x + panel.width / 2)},${number(panel.y + panel.height / 2)}),float2(${number(panel.width / 2)},${number(panel.height / 2)}),${number(panel.radius ?? 24)},time+${number(index * 1.7)});
    result=layer+result*(1.0-layer.a);
  }`).join("\n")}\nreturn half4(result); }`;
}

/** Pass stable panel geometry. Pulsing and shimmer use the presentation GPU clock. */
export function GlassPanels({ panels, width, height, pulse = 0.003, edgeMotion = 1.2 }: {
  panels: readonly GlassPanelShape[];
  width: number;
  height: number;
  /** Fractional size variation; zero disables breathing without stopping shimmer. */
  pulse?: number;
  /** Edge displacement in logical slide pixels; zero keeps the contour rigid. */
  edgeMotion?: number;
}) {
  const effect = useMemo(() => {
    const compiled = Skia.RuntimeEffect.Make(createGlassPanelsShader(panels));
    if (!compiled) throw new Error("Could not compile glass panels");
    return compiled;
  }, [panels]);
  const uniforms = useAnimatedShaderUniforms({ pulse, edgeMotion }, 8);
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height }}>
    <Fill><Shader source={effect} uniforms={uniforms} /></Fill>
  </Canvas>;
}
