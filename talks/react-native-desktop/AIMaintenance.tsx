import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

const implementations = ["React Native", "AppKit", "SwiftUI", "Electron", "Tauri", "Deno", "Flutter", "Compose", "GPUI"];
const branchX = (index: number) => 96 + index * 188;
const ease = (t: number) => t * t * (3 - 2 * t);

export const maintenanceTreeShader = `
uniform float time;
uniform float maintenance;
half4 main(float2 p) {
  float t=clamp((p.y-70.0)/370.0,0.0,1.0);
  float bend=t*t*(3.0-2.0*t);
  float3 tint=mix(float3(0.08,0.58,1.0),float3(1.0,0.08,0.14),maintenance);
  float3 light=mix(float3(0.6,0.91,1.0),float3(1.0,0.65,0.65),maintenance);
  float3 color=float3(0);
  for(int i=0;i<9;i++) {
    float endpoint=96.0+float(i)*188.0;
    float center=mix(848.0,endpoint,bend);
    float slope=(endpoint-848.0)*6.0*t*(1.0-t)/370.0;
    for(int strand=0;strand<2;strand++) {
      float phase=float(i)*0.7+float(strand)*3.14159;
      float offset=sin(t*8.0+phase)*sin(t*3.14159)*13.0;
      float d=(p.x-center-offset)/sqrt(1.0+slope*slope);
      float pulse=0.5+0.5*sin(time*1.4-t*6.0+phase);
      float radius=mix(14.0,3.0,t)*(0.9+pulse*0.2);
      float n=d/radius;
      float body=1.0-smoothstep(0.8,1.12,abs(n));
      float edge=exp(-abs(abs(d)-radius*0.87)*0.9);
      float ridge=exp(-pow((n+0.3)*4.0,2.0));
      float flow=pow(0.5+0.5*sin(t*22.0-time*3.0+phase),8.0);
      float fade=smoothstep(65.0,90.0,p.y)*(1.0-smoothstep(440.0,455.0,p.y));
      float3 ribbon=tint*(body*0.35+ridge*body*0.55+exp(-abs(d)/(radius*2.0))*0.08)
        +light*(edge*0.6+flow*body*0.35);
      color=max(color,ribbon*fade);
    }
    float tip=length(p-float2(endpoint,440.0));
    color+=tint*(exp(-tip*0.25)+exp(-tip*0.065)*0.16);
  }
  float alpha=clamp(max(color.r,max(color.g,color.b)),0.0,1.0);
  return half4(min(color,float3(alpha)),alpha);
}`;
const effect = Skia.RuntimeEffect.Make(maintenanceTreeShader);
if (!effect) throw new Error("Could not compile maintenance tree");
const samples = Array.from({ length: 33 }, (_, index) => index / 32);

function CryingEmoji({ index }: { index: number }) {
  const active = usePresentationValue("isActive");
  const preview = usePresentationValue("isPreview");
  const preparing = usePresentationValue("isPreparing");
  const progress = useRef(new Animated.Value((index + 1) / 10)).current;
  useEffect(() => {
    if (!active || preview || preparing) { progress.setValue((index + 1) / 10); return; }
    progress.setValue(0);
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 3100 + index * 190, easing: Easing.linear, useNativeDriver: true,
      isInteraction: false,
    }));
    animation.start();
    return () => animation.stop();
  }, [active, preview, preparing, index, progress]);
  return <Animated.Text style={{ position: "absolute", left: -21, top: -24, fontSize: 40, lineHeight: 50,
    opacity: progress.interpolate({ inputRange: [0, 0.12, 0.86, 1], outputRange: [0, 1, 1, 0] }),
    transform: [
      { translateX: progress.interpolate({ inputRange: samples, outputRange: samples.map(t => 848 + (branchX(index) - 848) * ease(t)) }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [70, 440] }) },
    ],
  }}>😭</Animated.Text>;
}

export function AIMaintenance() {
  const maintenance = usePresentationValue("stepIndex") > 0;
  const uniforms = useAnimatedShaderUniforms({ maintenance: maintenance ? 1 : 0 }, 8);
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <MovingTitle><Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 88, fontWeight: "600", textAlign: "center" }}>{maintenance ? "You maintain it nine times" : "AI can write it nine times"}</Text></MovingTitle>
    <View style={{ position: "absolute", left: 0, top: 180, width: 1696, height: 520 }}>
      <Canvas pointerEvents="none" style={{ position: "absolute", inset: 0 }}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>
      <Text style={{ position: "absolute", top: 0, left: 600, width: 496, textAlign: "center", color: maintenance ? "#fda4af" : "#8de4ff", fontSize: 40, lineHeight: 52 }}>{maintenance ? "One bug fix" : "One feature"}</Text>
      {maintenance && implementations.map((name, index) => <CryingEmoji key={name} index={index} />)}
      {implementations.map((name, index) => <View key={name} style={{ position: "absolute", left: branchX(index) - 91, top: 477, width: 182, alignItems: "center" }}>
        <Text style={{ color: "#f1f5f9", fontSize: 25, lineHeight: 34, textAlign: "center", fontWeight: name === "React Native" ? "700" : "500" }}>{name}</Text>
        <SceneMotionView hidden={!maintenance} pose={{ opacity: maintenance ? 1 : 0 }} duration={450} style={{ marginTop: 12 }}>
          <Text style={{ color: "#fda4af", fontSize: 24 }}>Fix + verify</Text>
        </SceneMotionView>
      </View>)}
    </View>
  </View>;
}
