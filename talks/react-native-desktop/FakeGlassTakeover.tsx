import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { StyleSheet, Text } from "react-native";
import { composerRect, detailCamera } from "./NineAppsTour";

// Deliberately excessive procedural imitation, not an OS material or benchmark capture.
const effect = Skia.RuntimeEffect.Make(`
  uniform float time;
  half4 main(float2 p) {
    float2 uv = p / float2(800.0, 160.0);
    float wave = sin(uv.x * 19.0 + time * 2.4) * cos(uv.y * 9.0 - time * 1.8);
    float lens = sin(length((uv - 0.5) * float2(1.0, 0.6)) * 38.0 - time * 3.0);
    float3 rainbow = 0.5 + 0.5 * cos(float3(0.0, 2.1, 4.2) + wave * 2.0 + lens + time);
    float shine = pow(max(0.0, sin(uv.x * 12.0 + uv.y * 7.0 + wave + time)), 14.0);
    float grid = pow(abs(cos(uv.x * 35.0 + wave) * cos(uv.y * 18.0 + lens)), 12.0);
    return half4(rainbow * 0.6 + shine * 0.9 + grid * 0.45, 0.97);
  }
`);
if (!effect) throw new Error("Could not compile the fake glass joke");

export function FakeGlassTakeover({ visible, expanded }: { visible: boolean; expanded: boolean }) {
  const camera = detailCamera("composer");
  const cx = 960 + (composerRect.x + composerRect.width / 2 - 960) * camera.scaleX + camera.x;
  const cy = 540 + (composerRect.y + composerRect.height / 2 - 540) * camera.scaleY + camera.y;
  return <SceneMotionView duration={800} hidden={!visible}
    pose={{ x: expanded ? 0 : cx - 960, y: expanded ? 0 : cy - 540,
      scaleX: expanded ? 1920 / 800 : composerRect.width * camera.scaleX / 800,
      scaleY: expanded ? 1080 / 160 : composerRect.height * camera.scaleY / 160,
      opacity: visible ? 1 : 0 }}
    style={{ position: "absolute", zIndex: 3000, left: 560, top: 460, width: 800, height: 160, borderRadius: 22, overflow: "hidden", borderWidth: 2, borderColor: "white" }}>
    {visible && <FakeGlassShader />}
    <Text style={{ position: "absolute", left: 26, top: 20, color: "white", fontSize: 22, fontWeight: "700" }}>Totally native. Obviously.</Text>
  </SceneMotionView>;
}

function FakeGlassShader() {
  const uniforms = useAnimatedShaderUniforms({}, 8);
  return <Canvas style={StyleSheet.absoluteFill}><Fill><Shader source={effect!} uniforms={uniforms} /></Fill></Canvas>;
}
