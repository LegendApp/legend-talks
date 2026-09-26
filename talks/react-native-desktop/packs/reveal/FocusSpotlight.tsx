import { FrameView, FrameShader } from "../shared/FrameView";
import { Canvas, Fill, Shader, Skia, vec } from "@shopify/react-native-skia";
import { StyleSheet, Text, View } from "react-native";
import { effectAmount, effectDuration, loopTime, type EffectProfileProps } from "../shared/effectProfile";
import { smooth, useEffectTime } from "../shared/effectRuntime";
const width = 1680;
const height = 580;
const points = [260, 820, 1370];
const spotlight = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float2 center;
  uniform float darkness;
  uniform float radius;
  uniform float time;

  half4 main(float2 position) {
    float2 delta = (position - center) / float2(1.0, 0.76);
    float distance = length(delta);
    float hole = smoothstep(radius * 0.48, radius, distance);
    float ring = exp(-abs(distance - radius * 0.72) / 16.0);
    float dust = pow(max(0.0, sin(position.x * 0.035 + position.y * 0.018 - time * 2.4)), 22.0);
    float alpha = hole * darkness;
    float3 color = float3(0.01, 0.018, 0.045);
    color += float3(0.16, 0.8, 0.9) * ring * 0.16;
    color += float3(0.2, 0.55, 0.8) * dust * (1.0 - hole) * 0.08;
    return half4(color, alpha);
  }
`);
const ideas = [["01", "React", "Compose the product"], ["02", "Native", "Use the platform"], ["03", "GPU", "Render the impossible"]];
export function FocusSpotlight({
  durationSeconds,
  intensity = "heavy",
  previewProgress = 0.52,
  tempo = "slow"
}: EffectProfileProps) {
  const duration = effectDuration(tempo, durationSeconds, 8.4, 4.2);
  const amount = effectAmount(intensity, 0.44, 1);
  const time = useEffectTime(duration * previewProgress);
  return <View style={styles.frame}>
      <View style={styles.cards}>
        {ideas.map(([number, title, detail], index) => <FrameView key={title} frameStyle={() => {
        "worklet";

        return [styles.card, Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3)) === index && styles.cardActive];
      }}>
            <Text style={styles.number}>{number}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.detail}>{detail}</Text>
          </FrameView>)}
      </View>
      <View pointerEvents="none" style={styles.overlay}>
        <Canvas style={styles.overlay}>
          <Fill>
            {spotlight && <FrameShader source={spotlight} uniformsForFrame={() => {
            "worklet";

            return {
              center: {
                x: points[Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3))] + (points[Math.min(2, Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3)) + 1)] - points[Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3))]) * smooth(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3 % 1),
                y: 270
              },
              darkness: 0.64 + amount * 0.28,
              radius: 190 + amount * 90,
              resolution: {
                x: width,
                y: height
              },
              time: time.value
            };
          }} />}
          </Fill>
        </Canvas>
      </View>
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.focusLabel, {
        left: points[Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3))] + (points[Math.min(2, Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3)) + 1)] - points[Math.min(2, Math.floor(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3))]) * smooth(smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 3 % 1) - 92
      }];
    }}><Text style={styles.focusLabelText}>FOCUS</Text></FrameView>
      <Text style={styles.caption}>Move attention without moving the entire slide.</Text>
    </View>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0a1324",
    borderColor: "#26344c",
    borderRadius: 28,
    borderWidth: 2,
    height: 330,
    padding: 32,
    width: 460
  },
  cardActive: {
    borderColor: "#67e8f9"
  },
  cards: {
    flexDirection: "row",
    gap: 44,
    justifyContent: "center",
    paddingTop: 92
  },
  caption: {
    bottom: 2,
    color: "#94a3b8",
    fontSize: 24,
    left: 40,
    position: "absolute",
    zIndex: 4
  },
  detail: {
    color: "#94a3b8",
    fontSize: 25,
    marginTop: 22
  },
  focusLabel: {
    alignItems: "center",
    borderColor: "#67e8f9",
    borderRadius: 14,
    borderWidth: 1,
    position: "absolute",
    top: 37,
    width: 184,
    zIndex: 5
  },
  focusLabelText: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 4,
    paddingVertical: 8
  },
  frame: {
    height,
    overflow: "hidden",
    position: "relative",
    width
  },
  number: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 3
  },
  overlay: {
    height,
    left: 0,
    position: "absolute",
    top: 0,
    width
  },
  title: {
    color: "#f8fafc",
    fontSize: 58,
    fontWeight: "800",
    marginTop: 52
  }
});
