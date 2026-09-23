import { Canvas, Fill, ImageShader, Shader, Skia, makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import { snapshotCaptureQueue, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { useEffect, useState, type RefObject } from "react";
import { View } from "react-native";
import { takeoverComposerRect } from "./NineAppsTour";

const rect = takeoverComposerRect();
const initialUniforms = {
  composer: [rect.x, rect.y, rect.width, rect.height],
  cornerRadius: rect.radius,
};

// Sample the actual paused chat. Refraction is confined to the curved bevel;
// the body softly frosts that content instead of generating an opaque texture.
export const composerGlassShader = `
uniform shader backdrop;
uniform float time;
uniform float4 composer;
uniform float cornerRadius;
float boxDistance(float2 p, float2 halfSize, float radius) {
  float2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}
half4 sampleBackdrop(float2 p) {
  half4 content = backdrop.eval(clamp(p, float2(0.5), float2(1919.5, 1079.5)));
  return content + half4(0.035, 0.052, 0.075, 1.0) * (1.0 - content.a);
}
half4 main(float2 position) {
  float grow = smoothstep(5.0, 13.0, time);
  float reveal = smoothstep(0.0, 1.4, time);
  float2 center = mix(composer.xy + composer.zw * 0.5, float2(960, 540), grow);
  float2 halfSize = mix(composer.zw * 0.5, float2(1040, 620), grow);
  float radius = mix(cornerRadius, 100.0, grow);
  float2 p = position - center;
  float distance = boxDistance(p, halfSize, radius);
  float mask = 1.0 - smoothstep(-0.75, 0.75, distance);
  if (mask == 0.0) return half4(0);
  float2 normal = normalize(float2(
    boxDistance(p + float2(0.5, 0), halfSize, radius) - boxDistance(p - float2(0.5, 0), halfSize, radius),
    boxDistance(p + float2(0, 0.5), halfSize, radius) - boxDistance(p - float2(0, 0.5), halfSize, radius)) + float2(0.00001));
  float bevel = exp(-max(0.0, -distance) / 12.0);
  float2 samplePoint = position - normal * bevel * 9.0 * reveal;
  float blur = mix(2.0, 11.0, grow) * reveal;
  half4 color = half4(0);
  // Separable binomial weights approximate Gaussian frosting without repeated
  // offset text outlines from a sparse ring of equally weighted samples.
  for (int y = -2; y <= 2; y++) {
    float wy = y == 0 ? 6.0 : ((y == -1 || y == 1) ? 4.0 : 1.0);
    for (int x = -2; x <= 2; x++) {
      float wx = x == 0 ? 6.0 : ((x == -1 || x == 1) ? 4.0 : 1.0);
      color += sampleBackdrop(samplePoint + float2(x, y) * blur * 0.5) * (wx * wy / 256.0);
    }
  }
  float rim = exp(-abs(distance + 0.7) * 1.3);
  float light = pow(max(0.0, dot(normal, normalize(float2(-0.45, -0.85)))), 3.0);
  float sheen = 0.5 + 0.5 * sin(time * 0.35 + position.x / 1200.0);
  color.rgb = mix(color.rgb, half3(0.13, 0.145, 0.16), 0.10 * reveal);
  color.rgb += half3(0.9, 0.95, 1.0) * rim * (0.10 + light * 0.32) * reveal;
  color.rgb += half3(0.012, 0.014, 0.017) * bevel * sheen * reveal;
  float alpha = mask * reveal;
  return half4(color.rgb * alpha, alpha);
}`;
const effect = Skia.RuntimeEffect.Make(composerGlassShader);
if (!effect) throw new Error("Could not compile composer glass");

export function ComposerGlassTakeover({ sourceRef }: { sourceRef: RefObject<View | null> }) {
  const isActive = usePresentationValue("isActive");
  const isPreview = usePresentationValue("isPreview");
  const [image, setImage] = useState<SkImage>();
  const uniforms = useAnimatedShaderUniforms(initialUniforms, 3, { clock: "step" });
  useEffect(() => {
    if (!isActive && !isPreview) return;
    let cancelled = false;
    let captured: SkImage | undefined;
    const cancel = snapshotCaptureQueue.enqueue(async () => {
      try {
        const result = await makeImageFromView(sourceRef);
        if (cancelled) { result?.dispose(); return; }
        captured = result ?? undefined;
        setImage(captured);
      } catch {
        // Keep the real composer visible if native capture is unavailable.
      }
    });
    return () => { cancelled = true; cancel(); setImage(undefined); captured?.dispose(); };
  }, [isActive, isPreview, sourceRef]);
  if (!image) return null;
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 3000 }}>
    <Fill><Shader source={effect!} uniforms={uniforms}>
      <ImageShader image={image} fit="fill" rect={{ x: 0, y: 0, width: 1920, height: 1080 }} tx="clamp" ty="clamp" />
    </Shader></Fill>
  </Canvas>;
}
