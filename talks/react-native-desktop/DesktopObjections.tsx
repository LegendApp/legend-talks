import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// One bounded GPU surface per panel. Reflections, cracks, and
// ballistic glass fragments are analytic; no captured views or JS frame updates.
export const objectionGlassShader = `
uniform float time;
uniform float broken;
uniform float settled;
uniform float phase;
uniform float success;
uniform float centerX;
float hash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
float2 rotatePoint(float2 p, float a) {
  float c = cos(a), s = sin(a);
  return float2(c*p.x-s*p.y, s*p.x+c*p.y);
}
float box(float2 p) {
  float2 q = abs(p) - float2(211.0, 151.0);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 40.0;
}
float stroke(float2 p, float2 a, float2 b, float progress) {
  float2 v = (b-a) * max(progress, 0.001);
  return length(p-a-v*clamp(dot(p-a,v)/dot(v,v), 0.0, 1.0));
}
float4 glass(float2 p, float clock) {
  float d = box(p);
  float mask = 1.0-smoothstep(-0.7, 0.7, d);
  float rim = exp(-abs(d+3.0)*0.35);
  float inner = exp(-abs(d+14.0)*0.10);
  float directional = 0.45 + 0.55*pow(0.5+0.5*sin(atan(p.y,p.x)*2.0-0.7), 3.0);
  float reflectionAxis = (p.x*0.30+p.y+93.0+sin(clock*0.35+phase)*12.0)/27.0;
  float reflection = exp(-reflectionAxis*reflectionAxis);
  float3 color = float3(0.025,0.07,0.115)
    + float3(0.50,0.81,1.0)*rim*directional
    + float3(0.08,0.28,0.39)*inner
    + float3(0.11,0.18,0.23)*reflection;
  float alpha = mask*0.92;
  return float4(color*alpha,alpha);
}
half4 main(float2 position) {
  float2 p = position-float2(centerX,300.0);
  float clock = time+phase;
  float elapsed = min(mix(time,6.0,settled),6.0);
  float resolve = broken*success*smoothstep(1.2,2.2,elapsed);
  float impact = broken*step(0.38,elapsed);
  float flight = max(elapsed-0.38,0.0);
  float travel = 1.0-exp(-flight*3.8);
  float4 result = float4(0.0);
  if (impact < 0.5) {
    result = glass(p,clock);
  } else if (flight < 4.0) {
    // Cut the actual panel into 18 irregular radial shards. Inverse-transform
    // each shard so its original glass reflection travels with the fragment.
    for (int i=0; i<18; i++) {
      float id = float(i);
      float start = id + (i == 0 ? 0.0 : (hash(id+7.0)-0.5)*0.55);
      float end = id+1.0 + (i == 17 ? 0.0 : (hash(id+8.0)-0.5)*0.55);
      float a = (start/18.0)*6.283185-3.141593;
      float width = (end-start)*6.283185/18.0;
      float random = hash(id+phase);
      float2 direction = float2(cos(a+width*0.5),sin(a+width*0.5));
      float distance = (30.0+random*145.0)*travel;
      float2 offset = direction*(distance+flight*35.0) + float2(0.0,flight*flight*(140.0+70.0*random));
      float spin = (random-0.5)*(travel*1.1+flight*1.6);
      float2 original = rotatePoint(p-offset,-spin);
      float theta = atan(original.y,original.x);
      float wedge = step(a,theta)*(1.0-step(a+width,theta));
      if (wedge > 0.5 && box(original) < 1.0) {
        float4 shard = glass(original,0.38+phase);
        float edgeDistance = length(original)*min(theta-a,a+width-theta);
        float edge = exp(-edgeDistance*0.85);
        shard.rgb += float3(0.52,0.82,1.0)*edge*shard.a;
        result = shard + result*(1.0-shard.a);
      }
    }
    // Small angular chips burst out faster than the large pieces.
    for (int j=0; j<12; j++) {
      float id = float(j);
      float a = id*2.39996;
      float random = hash(id+41.0);
      float2 center = float2(cos(a),sin(a))*(180.0+travel*(80.0+random*140.0));
      center.y += flight*flight*(160.0+random*80.0);
      float2 q = rotatePoint(p-center,a+flight*3.0);
      float triangle = max(abs(q.x)*0.866+q.y*0.5,-q.y)-(4.0+random*7.0);
      float alpha = 1.0-smoothstep(-0.5,0.7,triangle);
      float4 chip = float4(float3(0.58,0.84,1.0)*alpha,alpha);
      result = chip+result*(1.0-chip.a);
    }
  }
  if (broken > 0.5) {
    // Deliberately overshoot the panel: two furious strokes, then the impact.
    float first = clamp(elapsed/0.17,0.0,1.0);
    float second = clamp((elapsed-0.21)/0.17,0.0,1.0);
    float2 a = mix(float2(-302.0,-240.0),float2(-92.0,108.0),resolve);
    float2 b = mix(float2(306.0,238.0),float2(-25.0,178.0),resolve);
    float2 c = mix(float2(298.0,-245.0),float2(104.0,66.0),resolve);
    float2 end = mix(float2(-309.0,246.0),float2(-25.0,178.0),resolve);
    float d = stroke(p,a,b,first);
    float e = stroke(p,c,end,second);
    float distance = min(d+10000.0*(1.0-step(0.001,first)),e+10000.0*(1.0-step(0.001,second)));
    float roughness = sin(p.x*0.15+p.y*0.22)*0.8+sin(p.y*0.43)*0.6;
    float pulse = success*(0.5+0.5*sin(time*mix(7.0,3.5,resolve)));
    float thickness = mix(17.0,11.0,resolve)+pulse*3.5;
    float line = 1.0-smoothstep(thickness+roughness,thickness+4.0+roughness,distance);
    float core = exp(-distance*distance*0.035);
    float glow = exp(-distance*0.045)*(0.60+pulse*0.25);
    float flash = impact*exp(-flight*12.0);
    float alpha = clamp(line+glow,0.0,1.0);
    float3 tint = mix(float3(1.0,0.045,0.025),float3(0.12,0.95,0.38),resolve);
    float shimmer = success*pow(0.5+0.5*sin(p.x*0.045+p.y*0.025-time*mix(12.0,5.0,resolve)),8.0);
    float3 color = mix(tint,float3(1.0,0.96,0.8),clamp(core*0.6+shimmer*0.7,0.0,1.0));
    float4 slash = float4(color*alpha,alpha);
    result = slash+result*(1.0-slash.a);
    // Shape time settles, but the lifecycle-controlled GPU clock keeps the
    // success check shimmering and emitting green sparks while active.
    if (success > 0.5 && elapsed > 0.38) {
      for (int k=0; k<24; k++) {
        float id = float(k);
        float seed = hash(id+71.0);
        float age = fract(time*0.85+seed);
        float along = hash(id+23.0);
        float2 origin = k < 12 ? mix(a,b,along) : mix(c,end,along);
        float angle = hash(id+107.0)*6.283185;
        float2 velocity = float2(cos(angle),sin(angle))*(45.0+seed*100.0);
        float2 center = origin+velocity*age+float2(0.0,age*age*45.0);
        float dist = length(p-center);
        float life = sin(age*3.141593)*(0.75+pulse*0.25);
        float spark = (exp(-dist*dist/5.0)+0.25*exp(-dist*0.24))*life;
        float4 particle = float4(mix(tint,mix(float3(1.0,0.92,0.64),float3(0.65,1.0,0.78),resolve),0.45)*spark,spark);
        result = particle+result*(1.0-particle.a);
      }
    }
    result.rgb += float3(0.38,0.58,0.68)*flash*exp(-length(p)*0.009);
    result.a = max(result.a,flash*exp(-length(p)*0.009));
  }
  // The enclosing native canvas is transparent; return premultiplied color.
  return half4(min(result.rgb,float3(result.a)),result.a);
}`;
const glassEffect = Skia.RuntimeEffect.Make(objectionGlassShader);
if (!glassEffect) throw new Error("Could not compile objection glass");

function GlassPanel({ crossed, settled, index }: { crossed: boolean; settled: boolean; index: number }) {
  const uniforms = useAnimatedShaderUniforms({ broken: crossed ? 1 : 0, settled: settled ? 1 : 0, phase: index * 1.7, success: index === 0 ? 1 : 0, centerX: crossed ? 396 + index * 564 : 350 }, crossed ? 6 : 2);
  // Crossed panels draw across the full stage and below its bottom. The shader
  // origin stays on this panel while fragments can cross neighboring columns.
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: crossed ? -142 - index * 564 : -96, top: -108, width: crossed ? 1920 : 700, height: crossed ? 1080 : 600 }}>
    <Fill><Shader source={glassEffect!} uniforms={uniforms} /></Fill>
  </Canvas>;
}

export function DesktopObjections({ returning = false }: { returning?: boolean }) {
  const step = usePresentationValue("stepIndex");
  const zoom = returning && step >= 2;
  const crossed = [returning || step >= 1, false, returning && step >= 1];
  return <View style={{ width: 1696, height: 660, marginTop: 45, alignSelf: "center" }}>
    {["Performance", "Existing modules", "New modules for\ndesktop things"].map((label, index) => {
      const center = index === 1;
      return <SceneMotionView key={label} duration={850}
        pose={{ x: zoom && !center ? (index === 0 ? -450 : 450) : 0,
          y: zoom && center ? 35 : 0,
          scaleX: zoom && center ? 1.65 : 1, scaleY: zoom && center ? 1.65 : 1,
          opacity: zoom && !center ? 0 : 1 }}
        style={{ position: "absolute", left: 30 + index * 564, top: 105, width: 508, height: 384 }}>
        {/* Remount only when crossed state changes: replay on re-cross, restore
            intact glass on reverse, and preserve the strike during the zoom. */}
        <GlassPanel key={String(crossed[index])} crossed={crossed[index]!} settled={returning && index === 0} index={index} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#ffffff", fontSize: 42, fontWeight: "600", textAlign: "center", lineHeight: 54,
            textShadowColor: "#07121f", textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } }}>{label}</Text>
        </View>
      </SceneMotionView>;
    })}
  </View>;
}
