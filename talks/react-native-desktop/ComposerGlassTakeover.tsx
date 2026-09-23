import { Canvas, Fill, ImageShader, Shader, Skia, useImage } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
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
  return content + half4(0.025, 0.025, 0.025, 1.0) * (1.0 - content.a);
}
half4 main(float2 position) {
  // Finish the realistic material at 0.8s, hold it for two full seconds,
  // then distort it inside the composer before expanding across the slide.
  float reveal = smoothstep(0.0, 0.8, time);
  float wild = smoothstep(2.8, 5.8, time);
  float grow = smoothstep(6.0, 12.0, time);
  float2 center = mix(composer.xy + composer.zw * 0.5, float2(960, 540), grow);
  float2 halfSize = mix(composer.zw * 0.5, float2(1040, 620), grow);
  float radius = mix(cornerRadius, 100.0, grow);
  float2 p = position - center;
  float ripple = sin(p.x * 0.022 + time * 2.2) * sin(p.y * 0.018 - time * 1.7);
  float distance = boxDistance(p, halfSize, radius) + ripple * 5.0 * wild;
  float mask = 1.0 - smoothstep(-0.75, 0.75, distance);
  if (mask == 0.0) return half4(0);
  float2 normal = normalize(float2(
    boxDistance(p + float2(0.5, 0), halfSize, radius) - boxDistance(p - float2(0.5, 0), halfSize, radius),
    boxDistance(p + float2(0, 0.5), halfSize, radius) - boxDistance(p - float2(0, 0.5), halfSize, radius)) + float2(0.00001));
  float depth = max(0.0, -distance);
  float bevel = exp(-depth / mix(10.0, 32.0, wild));
  float lens = sqrt(max(0.0, 1.0 - pow(clamp(p.y / halfSize.y, -1.0, 1.0), 2.0)));
  float2 flow = float2(sin(p.y * 0.026 + time * 1.8), cos(p.x * 0.017 - time * 1.4));
  float2 samplePoint = position - normal * bevel * mix(14.0, 85.0, wild) * reveal
    + flow * (8.0 + 55.0 * lens) * wild;
  float blur = mix(1.8, 4.0, wild) * reveal;
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
  // Disperse the light only at the curved edge, keeping the initial body clear.
  float dispersion = bevel * mix(0.8, 12.0, wild) * reveal;
  color.r = mix(color.r, sampleBackdrop(samplePoint + normal * dispersion).r, 0.6);
  color.b = mix(color.b, sampleBackdrop(samplePoint - normal * dispersion).b, 0.6);
  float rim = exp(-abs(distance + 0.7) * 1.3);
  float innerRim = exp(-abs(distance + mix(3.0, 9.0, wild)) * 0.7);
  float light = pow(max(0.0, dot(normal, normalize(float2(-0.45, -0.85)))), 3.0);
  float sheen = 0.5 + 0.5 * sin(time * 0.35 + position.x / 1200.0);
  color.rgb = mix(color.rgb, half3(0.16), 0.04 * reveal);
  color.rgb += half3(0.9, 0.95, 1.0) * rim * (0.20 + light * 0.55) * reveal;
  color.rgb += half3(0.95) * innerRim * (0.08 + 0.3 * wild) * reveal;
  float caustic = pow(max(0.0, sin(p.x * 0.016 + p.y * 0.035 + time * 2.0)), 12.0);
  color.rgb += half3(1.0) * caustic * bevel * 0.45 * wild;
  color.rgb += half3(0.035) * bevel * sheen * reveal;
  float alpha = mask * reveal;
  return half4(color.rgb * alpha, alpha);
}`;
const effect = Skia.RuntimeEffect.Make(composerGlassShader);
if (!effect) throw new Error("Could not compile composer glass");

// Map the captured video pixels through exactly the same composer crop as the camera.
const videoScale = rect.width / 1684;
const videoRect = { x: rect.x - 698 * videoScale, y: rect.y - 1208 * videoScale,
  width: 2560 * videoScale, height: 1440 * videoScale };

export function ComposerGlassTakeover({ frame }: { frame?: string }) {
  const image = useImage(frame ?? null);
  const uniforms = useAnimatedShaderUniforms(initialUniforms, 3, { clock: "step" });
  if (!image) return null;
  return <Canvas pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 3000 }}>
    <Fill><Shader source={effect!} uniforms={uniforms}>
      <ImageShader image={image} fit="fill" rect={videoRect} tx="clamp" ty="clamp" />
    </Shader></Fill>
  </Canvas>;
}
