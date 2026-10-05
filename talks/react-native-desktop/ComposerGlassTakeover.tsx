import { Canvas, Fill, ImageShader, Shader, Skia, type SkImage } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { takeoverComposerRect } from "./NineAppsTour";

const rect = takeoverComposerRect();
const initialUniforms = {
  composer: [rect.x, rect.y, rect.width, rect.height],
  cornerRadius: rect.radius,
};

// Refract the same live decoded frame as the card. A convex edge bends the
// recording while the center stays clear; step time controls the exaggeration.
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
  return content + half4(0.025, 0.025, 0.025, 1.0) * (1.0 - content.a);
}
half4 main(float2 position) {
  float reveal = smoothstep(0.0, 0.8, time);
  float wild = smoothstep(0.8, 2.0, time);
  float2 center = composer.xy + composer.zw * 0.5;
  float2 halfSize = composer.zw * 0.5;
  float radius = cornerRadius;
  float2 p = position - center;
  float ripple = sin(p.x * 0.022 + time * 2.2) * sin(p.y * 0.018 - time * 1.7);
  float distance = boxDistance(p, halfSize, radius) + ripple * 5.0 * wild;
  float mask = 1.0 - smoothstep(-0.75, 0.75, distance);
  if (mask == 0.0) return half4(0);
  float2 normal = normalize(float2(
    boxDistance(p + float2(0.5, 0), halfSize, radius) - boxDistance(p - float2(0.5, 0), halfSize, radius),
    boxDistance(p + float2(0, 0.5), halfSize, radius) - boxDistance(p - float2(0, 0.5), halfSize, radius)) + float2(0.00001));
  float depth = max(0.0, -distance);
  float bevelWidth = mix(18.0, 65.0, wild);
  float edge = clamp(1.0 - depth / bevelWidth, 0.0, 1.0);
  float bevel = edge * edge * (3.0 - 2.0 * edge);
  // A rounded meniscus: strongest bending just inside the silhouette.
  float curvature = sin(edge * 1.5707963);
  float3 surfaceNormal = normalize(float3(normal * curvature * 0.88,
    sqrt(max(0.02, 1.0 - curvature * curvature * 0.77))));
  float lens = sqrt(max(0.0, 1.0 - pow(clamp(p.y / halfSize.y, -1.0, 1.0), 2.0)));
  float2 flow = float2(sin(p.y * 0.026 + time * 1.8), cos(p.x * 0.017 - time * 1.4));
  float2 samplePoint = position - normal * curvature * mix(23.0, 105.0, wild) * reveal
    + flow * (8.0 + 55.0 * lens) * wild;
  float blur = mix(0.65, 3.0, wild) * reveal;
  half4 color = half4(0);
  // Nine weighted taps keep the center readable.
  for (int y = -1; y <= 1; y++) {
    float wy = y == 0 ? 2.0 : 1.0;
    for (int x = -1; x <= 1; x++) {
      float wx = x == 0 ? 2.0 : 1.0;
      color += sampleBackdrop(samplePoint + float2(x, y) * blur) * (wx * wy / 16.0);
    }
  }
  // Disperse the light only at the curved edge, keeping the initial body clear.
  float dispersion = bevel * mix(0.8, 12.0, wild) * reveal;
  color.r = mix(color.r, sampleBackdrop(samplePoint + normal * dispersion).r, 0.6);
  color.b = mix(color.b, sampleBackdrop(samplePoint - normal * dispersion).b, 0.6);
  float rim = exp(-abs(distance + 0.7) * 1.3);
  float innerRim = exp(-abs(distance + mix(3.0, 9.0, wild)) * 0.7);
  float3 lightDirection = normalize(float3(-0.45, -0.65, 0.7));
  float3 halfVector = normalize(lightDirection + float3(0, 0, 1));
  float specular = pow(max(0.0, dot(surfaceNormal, halfVector)), 48.0);
  float fresnel = pow(1.0 - surfaceNormal.z, 3.0);
  float sweep = exp(-pow((p.x / max(halfSize.x, 1.0)
    - sin(time * 0.65) * 1.2) * 8.0, 2.0));
  float light = max(0.0, dot(normal, normalize(float2(-0.45, -0.85))));
  // Neutral reflected light, a narrow bright rim, and a darker inner lip give
  // the lens thickness without painting an opaque blue panel over the video.
  color.rgb *= 1.0 - innerRim * 0.16 * reveal;
  color.rgb += half3(0.94, 0.97, 1.0) * rim * (0.26 + light * 0.5) * reveal;
  color.rgb += half3(1.0) * (specular * bevel * 0.52 + fresnel * 0.16
    + sweep * bevel * 0.14) * reveal;
  float caustic = pow(max(0.0, sin(p.x * 0.016 + p.y * 0.035 + time * 2.0)), 12.0);
  color.rgb += half3(1.0) * caustic * bevel * 0.45 * wild;
  float alpha = mask * reveal;
  return half4(color.rgb * alpha, alpha);
}`;
const effect = Skia.RuntimeEffect.Make(composerGlassShader);
if (!effect) throw new Error("Could not compile composer glass");

// Map the live video pixels through exactly the same composer crop as the camera.
const videoScale = rect.width / 1684;
const videoRect = { x: rect.x - 698 * videoScale, y: rect.y - 1208 * videoScale,
  width: 2560 * videoScale, height: 1440 * videoScale };

export function ComposerGlassTakeover({ frame }: { frame: SharedValue<SkImage | null> }) {
  const uniforms = useAnimatedShaderUniforms(initialUniforms, 3, { clock: "step" });
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 3000 }}>
    <Fill><Shader source={effect!} uniforms={uniforms}>
      <ImageShader image={frame} fit="fill" rect={videoRect} tx="clamp" ty="clamp" />
    </Shader></Fill>
  </Canvas>;
}
