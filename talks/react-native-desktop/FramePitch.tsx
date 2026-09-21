import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { PlaybackKeyframeView, SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { GlassPanels } from "./GlassPanels";
import { objectionGlassShader } from "./DesktopObjections";

const effect = Skia.RuntimeEffect.Make(objectionGlassShader);
if (!effect) throw new Error("Could not compile Frame foundation reveal");
const layers = [{ x: 390, y: 205, width: 916, height: 82 }, { x: 390, y: 310, width: 916, height: 82 }];
const imports = [
  'import { openWindow } from "@legendapp/frame/windows"',
  'import { getDirectory } from "@legendapp/frame/files"',
  'import { settings } from "@legendapp/frame/settings"',
  'import { registerShortcut } from "@legendapp/frame/shortcuts"',
  'import { secureStorage } from "@legendapp/frame/secure-storage"',
];
const reveal = [{ time: 0, x: 0, y: 24, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];
const hide = [{ time: 0, x: 0, y: 0, opacity: 1 }, { time: 380, x: 0, y: 0, opacity: 1 }, { time: 550, x: 0, y: 8, opacity: 0 }];

export function FramePitch({ icon }: { icon: string }) {
  const step = usePresentationValue("stepIndex");
  const uniforms = useAnimatedShaderUniforms({ resolveToCheck: 0, broken: step >= 2 ? 1 : 0, settled: 0, phase: 0, centerX: 848 }, step >= 2 ? 3 : 0, { clock: 2 });
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    <SceneMotionView pose={{ x: step ? 0 : 360, y: step ? 0 : 130 }} duration={950} style={{ position: "absolute", left: 530, top: 0, width: 636, height: 150, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <Image source={{ uri: icon }} style={{ width: 140, height: 140 }} resizeMode="contain" />
      <Text style={{ color: "white", fontSize: 70, fontWeight: "600" }}>Legend Frame</Text>
    </SceneMotionView>
    <SceneMotionView pose={{ opacity: step ? 0 : 1, x: step ? -180 : 0 }} duration={600} style={{ position: "absolute", left: 0, top: 240 }}>
      {imports.map((line, i) => <Text key={line} style={{ color: i % 2 ? "#b4e9c2" : "#87ddff", fontFamily: "Menlo", fontSize: 20, marginBottom: 30 }}>{line}</Text>)}
    </SceneMotionView>
    <SceneMotionView pose={{ opacity: step ? 0 : 1 }} duration={450} style={{ position: "absolute", left: 960, top: 340, width: 650 }}>
      <Text style={{ color: "white", fontSize: 40, textAlign: "center", lineHeight: 56 }}>Desktop APIs{"\n"}Native UI{"\n"}An Expo workflow</Text>
    </SceneMotionView>
    <SceneMotionView pose={{ opacity: step ? 1 : 0, y: step ? 0 : 60 }} duration={750} style={{ position: "absolute", inset: 0 }}>
      <GlassPanels panels={layers} width={1696} height={880} />
      {["Expo Desktop", "Expo"].map((name, i) => <Text key={name} style={{ position: "absolute", left: 390, top: 220 + i * 105, width: 916, textAlign: "center", fontSize: 40, fontWeight: "600", color: "white" }}>{name}</Text>)}
      <Canvas style={{ position: "absolute", left: 0, top: 340, width: 1696, height: 1080 }}>
        <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
      </Canvas>
      {step < 2 ? <Text style={{ position: "absolute", left: 560, top: 614, width: 576, textAlign: "center", fontSize: 52, color: "white" }}>WebView</Text>
        : <PlaybackKeyframeView keyframes={hide} previewTime={3} style={{ position: "absolute", left: 560, top: 614, width: 576 }}><Text style={{ textAlign: "center", fontSize: 52, color: "white" }}>WebView</Text></PlaybackKeyframeView>}
      {step >= 2 && <PlaybackKeyframeView keyframes={reveal} delay={1500} previewTime={3} style={{ position: "absolute", left: 500, top: 612, width: 696 }}>
        <Text style={{ textAlign: "center", fontSize: 62, fontWeight: "700", color: "#8ae5ff" }}>React Native</Text>
      </PlaybackKeyframeView>}
    </SceneMotionView>
  </View>;
}
