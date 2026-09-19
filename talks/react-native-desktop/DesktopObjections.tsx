import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

export const objectionStrikeShader = `
uniform float time;
float stroke(float2 p, float2 a, float2 b, float progress) {
  float2 v=(b-a)*max(progress,0.001);
  return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0));
}
half4 main(float2 p) {
  float first=clamp(time/0.14,0.0,1.0);
  float second=clamp((time-0.17)/0.12,0.0,1.0);
  float d=stroke(p,float2(40,42),float2(468,278),first);
  float e=stroke(p,float2(471,38),float2(37,284),second);
  float line=max((1.0-smoothstep(5.0,7.0,d))*step(0.001,first),
    (1.0-smoothstep(5.0,7.0,e))*step(0.001,second));
  float glow=max(exp(-d*0.12)*step(0.001,first),exp(-e*0.12)*step(0.001,second));
  float impact=exp(-max(time-0.29,0.0)*16.0)*step(0.29,time);
  float alpha=clamp(line+glow*0.26,0.0,1.0);
  float3 color=mix(float3(1.0,0.26,0.22),float3(1.0,0.88,0.75),impact*0.8);
  return half4(color*alpha,alpha);
}`;
const strike = Skia.RuntimeEffect.Make(objectionStrikeShader);
if (!strike) throw new Error("Could not compile objection strike");

function AnimatedStrike() {
  // Mounting on the step starts a one-shot slash; previews show the completed X.
  const uniforms = useAnimatedShaderUniforms({}, 1);
  return <Fill><Shader source={strike!} uniforms={uniforms} /></Fill>;
}
function CrossOut({ animate }: { animate: boolean }) {
  return <SceneMotionView duration={180} initialPose={animate ? { scaleX: 1.12, scaleY: 1.12 } : undefined}
    pose={{ scaleX: 1, scaleY: 1 }} style={{ position: "absolute", inset: 0 }}>
    <Canvas style={{ width: 508, height: 320 }}>
      {animate ? <AnimatedStrike /> : <Fill><Shader source={strike!} uniforms={{ time: 1 }} /></Fill>}
    </Canvas>
  </SceneMotionView>;
}

export function DesktopObjections({ returning = false }: { returning?: boolean }) {
  const step = usePresentationValue("stepIndex");
  const zoom = returning && step >= 2;
  const crossed = [returning || step >= 1, false, returning && step >= 1];
  return <View style={{ width: 1696, height: 660, marginTop: 65, alignSelf: "center" }}>
    {["Performance", "Existing modules", "New modules for\ndesktop things"].map((label, index) => {
      const center = index === 1;
      return <SceneMotionView key={label} duration={850}
        pose={{ x: zoom && !center ? (index === 0 ? -450 : 450) : 0,
          y: zoom && center ? 35 : 0,
          scaleX: zoom && center ? 1.8 : 1, scaleY: zoom && center ? 1.8 : 1,
          opacity: zoom && !center ? 0 : 1 }}
        style={{ position: "absolute", left: 30 + index * 564, top: 55, width: 508, height: 320 }}>
        <View style={{ flex: 1, borderRadius: 28, borderWidth: 2, borderColor: center && zoom ? "#a4ecff" : "#7195ae",
          backgroundColor: "#102333", alignItems: "center", justifyContent: "center", padding: 28 }}>
          <Text style={{ color: "#f8fafc", fontSize: 42, fontWeight: "600", textAlign: "center", lineHeight: 54 }}>{label}</Text>
        </View>
        {crossed[index] && <CrossOut animate={returning ? index === 2 : index === 0} />}
      </SceneMotionView>;
    })}
  </View>;
}
