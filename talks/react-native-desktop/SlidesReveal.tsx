import { Canvas, Fill, ImageShader, Shader, Skia, useImage } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, ScenePositionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { SlidesHeader } from "./StoryDiagrams";
import { GitHubLink } from "./GitHubLink";
import type { TitleEntranceEffect } from "./titleEntrancePresets";

// @ts-ignore Local deck screenshot resolves to a file URL.
import screenshotAsset from "./rnconnection-assets/legend-slides-screenshot.png";

// Each shard samples the same screenshot before
// flying away; the clock, rotation, gravity and lighting all run on the GPU.
export const slidesShatterShader = `
uniform shader screenshotImage;
uniform float time;
uniform float stepIndex;
uniform float screenshotStep;
float box(float2 p,float2 size,float r) {
  float2 q=abs(p)-size+r;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;
}
float mask(float d) { return 1.0-smoothstep(-1.0,1.0,d); }
float4 screenshot(float2 p) {
  float a=mask(box(p,float2(520,355.319),18.0));
  return screenshotImage.eval(p+float2(520,355.319))*a;
}
half4 main(float2 p) {
  // Enlarge both the intact screenshot and its shards with one camera transform.
  p=(p-float2(960,600))/1.18;
  if(stepIndex<screenshotStep || stepIndex>screenshotStep+1.0) return half4(0);
  if(stepIndex<screenshotStep+1.0) {
    float entrance=smoothstep(0.0,0.65,time);
    float2 source=(p-float2(0,48.0*(1.0-entrance)))/mix(0.9,1.0,entrance);
    return screenshot(source)*entrance;
  }
  float t=max(time,0.0);
  if(t>3.2) return half4(0);
  float4 color=float4(0);
  // Two independently tumbling triangles per cell; alternate the diagonal.
  // Keep 40 fragments total, matching the previous shader workload.
  for(int y=0;y<4;y++) for(int x=0;x<5;x++) for(int shard=0;shard<2;shard++) {
    float id=float((y*5+x)*2+shard);
    float side=shard==0 ? -1.0 : 1.0;
    float diagonal=mod(float(x+y),2.0)<0.5 ? -1.0 : 1.0;
    float2 offset=float2(side*diagonal*104.0/3.0,-side*88.82975/3.0);
    float2 home=float2(-416.0+float(x)*208.0,-266.48925+float(y)*177.6595)+offset;
    float seed=fract(sin(id*78.23+1.0)*43758.54);
    float2 velocity=float2(home.x*(0.6+seed),-240.0-seed*420.0);
    float2 center=home+velocity*t+float2(0,720.0*t*t);
    float angle=(seed-0.5)*t*11.0;
    float2 q=p-center;
    q=float2(q.x*cos(angle)+q.y*sin(angle),-q.x*sin(angle)+q.y*cos(angle));
    float2 cellPoint=q+offset;
    float cut=side*dot(cellPoint,normalize(float2(-88.82975*diagonal,104.0)));
    float d=max(box(cellPoint,float2(104,88.82975),0.0),cut);
    float a=mask(d);
    float4 piece=screenshot(q+home)*a;
    float glint=exp(-abs(d)*1.3)*piece.a*(0.5+0.5*sin(t*17.0+id));
    piece.rgb+=float3(0.45,0.85,1)*glint*min(t*8.0,1.0);
    color=piece+color*(1.0-piece.a);
  }
  float flash=exp(-t*14.0)*exp(-length(p)/430.0)*min(t*50.0,1.0);
  color.rgb+=float3(0.5,0.85,1)*flash;
  color.a=max(color.a,flash);
  return half4(min(color.rgb,float3(color.a)),color.a);
}`;
const effect = Skia.RuntimeEffect.Make(slidesShatterShader);
if (!effect) throw new Error("Could not compile Slides screenshot shatter");
const linkReveal = [{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];

export function SlidesReveal({ icon, children, authoring, titleEntrance, showLinks = true }: {
  icon: string; children: ReactNode; authoring: ReactNode; titleEntrance?: TitleEntranceEffect; showLinks?: boolean;
}) {
  const screenshotImage = useImage(screenshotAsset);
  const step = usePresentationValue("stepIndex");
  const screenshotStep = showLinks ? 2 : 1;
  const uniforms = useAnimatedShaderUniforms({ screenshotStep }, 4, { clock: "step" });
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    {/* Report the step's destination to shared transitions as the header moves. */}
    <ScenePositionView style={{ width: 1696, zIndex: 2 }}
      y={step >= 1 ? 0 : (880 - 100) / 2} duration={650}>
      <SlidesHeader icon={icon} entrance={titleEntrance} />
    </ScenePositionView>
    {screenshotImage && <Canvas pointerEvents="none" accessibilityLabel="Legend Slides presenter window screenshot"
      style={{ position: "absolute", left: -112, top: -100, width: 1920, height: 1180 }}>
      <Fill><Shader source={effect!} uniforms={uniforms}>
        <ImageShader image={screenshotImage} fit="contain" rect={{ x: 0, y: 0, width: 1040, height: 710.638 }} tx="clamp" ty="clamp" />
      </Shader></Fill>
    </Canvas>}
    {step >= screenshotStep + 2 && <View style={{ position: "absolute", top: 0, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} previewTime={4}>
        {authoring}
      </PlaybackKeyframeView>
    </View>}
    {step === screenshotStep + 1 && <View style={{ position: "absolute", top: 0, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} delay={1600} previewTime={4}>
        {children}
      </PlaybackKeyframeView>
    </View>}
    {showLinks && step === 1 && <View style={{ position: "absolute", top: 405, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} previewTime={4}>
        <GitHubLink repository="LegendApp/legend-apps" label="Legend Slides on GitHub" />
        <Pressable accessibilityRole="link" accessibilityLabel="https://legend.so" onPress={() => Linking.openURL("https://legend.so")}
          style={{ alignSelf: "center", padding: 16, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 22 }}>
          <Text style={{ fontSize: 48, lineHeight: 60 }}>🌐</Text>
          <Text style={{ color: "#68ddff", fontSize: 54, fontWeight: "600" }}>https://legend.so</Text>
        </Pressable>
      </PlaybackKeyframeView>
    </View>}
  </View>;
}
