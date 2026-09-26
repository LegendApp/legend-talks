import { FrameView } from "../shared/FrameView";
import { StyleSheet, Text, View } from "react-native";
import { effectAmount, effectDuration, loopTime, type EffectProfileProps } from "../shared/effectProfile";
import { smooth, useEffectTime } from "../shared/effectRuntime";
const layers = [{
  color: "#67e8f9",
  label: "Text + controls",
  width: 980
}, {
  color: "#22d3ee",
  label: "React components",
  width: 1080
}, {
  color: "#818cf8",
  label: "Fabric nodes",
  width: 1180
}, {
  color: "#a78bfa",
  label: "Native views",
  width: 1280
}, {
  color: "#fb7185",
  label: "Platform surface",
  width: 1380
}];
export function ComponentXRay({
  durationSeconds,
  intensity = "heavy",
  previewProgress = 0.72,
  tempo = "slow"
}: EffectProfileProps) {
  const duration = effectDuration(tempo, durationSeconds, 6.8, 3.4);
  const amount = effectAmount(intensity, 0.4, 1);
  const time = useEffectTime(duration * previewProgress);
  return <View style={styles.frame}>
      {layers.map((layer, index) => {
      const depth = index - 2;
      return <FrameView key={layer.label} frameStyle={() => {
        "worklet";

        return [styles.layer, {
          backgroundColor: `${layer.color}18`,
          borderColor: layer.color,
          opacity: 0.45 + smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 0.55,
          top: 150 + depth * (smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * amount) * 64,
          transform: [{
            perspective: 1000
          }, {
            translateX: depth * (smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * amount) * 30
          }, {
            rotateX: `${-4 + smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * amount * 8}deg`
          }, {
            rotateY: `${depth * (smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * amount) * -1.7}deg`
          }],
          width: layer.width,
          zIndex: layers.length - index
        }];
      }}>
            <Text style={[styles.layerIndex, {
          color: layer.color
        }]}>0{index + 1}</Text>
            <Text style={styles.layerLabel}>{layer.label}</Text>
            <View style={[styles.layerRule, {
          backgroundColor: layer.color
        }]} />
          </FrameView>;
    })}
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.scan, {
        opacity: smooth(Math.min(1, loopTime(time.value, duration, 1) / duration)) * 0.8,
        top: 80 + time.value % 3.2 / 3.2 * 420
      }];
    }} />
      <Text style={styles.caption}>Pull the component apart, then put every layer back where it belongs.</Text>
    </View>;
}
const styles = StyleSheet.create({
  caption: {
    bottom: 2,
    color: "#94a3b8",
    fontSize: 24,
    left: 40,
    position: "absolute"
  },
  frame: {
    height: 580,
    overflow: "hidden",
    position: "relative",
    width: 1680
  },
  layer: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 22,
    borderWidth: 2,
    flexDirection: "row",
    height: 84,
    paddingHorizontal: 28,
    position: "absolute",
    shadowColor: "#020617",
    shadowOpacity: 0.5,
    shadowRadius: 18
  },
  layerIndex: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2
  },
  layerLabel: {
    color: "#f8fafc",
    fontSize: 29,
    fontWeight: "700",
    marginLeft: 26
  },
  layerRule: {
    height: 2,
    marginLeft: "auto",
    opacity: 0.55,
    width: 270
  },
  scan: {
    backgroundColor: "#67e8f9",
    height: 2,
    left: 100,
    position: "absolute",
    right: 100,
    shadowColor: "#67e8f9",
    shadowOpacity: 1,
    shadowRadius: 18,
    zIndex: 20
  }
});
