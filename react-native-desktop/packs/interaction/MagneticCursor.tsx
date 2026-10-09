import { FrameView } from "../shared/FrameView";
import { StyleSheet, Text, View } from "react-native";
import { effectAmount, effectDuration, type EffectProfileProps } from "../shared/effectProfile";
import { useEffectTime } from "../shared/effectRuntime";
const actions = [{
  color: "#67e8f9",
  detail: "Open a history",
  label: "Browse",
  x: 210,
  y: 150
}, {
  color: "#818cf8",
  detail: "Find native code",
  label: "Inspect",
  x: 650,
  y: 300
}, {
  color: "#fb7185",
  detail: "Verify the result",
  label: "Test",
  x: 1110,
  y: 120
}];
export function MagneticCursor({
  durationSeconds,
  intensity = "heavy",
  previewProgress = 0.62,
  tempo = "slow"
}: EffectProfileProps) {
  const duration = effectDuration(tempo, durationSeconds, 7.4, 3.8);
  const amount = effectAmount(intensity, 0.35, 1);
  const time = useEffectTime(duration * previewProgress);
  return <View style={styles.frame}>
      <Text style={styles.instructions}>POINTER-PROXIMITY FIELD</Text>
      {actions.map(action => {
      const centerX = action.x + 170;
      const centerY = action.y + 80;
      return <FrameView key={action.label} frameStyle={() => {
        "worklet";

        return [styles.action, {
          borderColor: Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount > 0.4 ? action.color : "#334155",
          left: action.x,
          shadowColor: action.color,
          shadowOpacity: Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount * 0.65,
          top: action.y,
          transform: [{
            translateX: (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) / Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) * (Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount) * 76
          }, {
            translateY: (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) / Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) * (Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount) * 54
          }, {
            rotate: `${(810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) / 520 * (Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount) * 3}deg`
          }, {
            scale: 1 + Math.max(0, 1 - Math.max(1, Math.sqrt((810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) * (810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - centerX) + (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY) * (250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - centerY))) / 540) * amount * 0.09
          }]
        }];
      }}>
            <View style={[styles.icon, {
          backgroundColor: action.color
        }]} />
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionDetail}>{action.detail}</Text>
          </FrameView>;
    })}
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.pointerHalo, {
        left: 810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - 46,
        top: 250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - 46
      }];
    }} />
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.pointer, {
        left: 810 + Math.cos(time.value / duration * Math.PI * 2) * 620 - 10,
        top: 250 + Math.sin(time.value / duration * Math.PI * 2 * 1.35) * 170 - 10
      }];
    }} />
      <Text style={styles.caption}>Small attraction feels responsive. Heavy attraction becomes the presentation.</Text>
    </View>;
}
const styles = StyleSheet.create({
  action: {
    backgroundColor: "#08111f",
    borderRadius: 24,
    borderWidth: 2,
    height: 160,
    padding: 26,
    position: "absolute",
    shadowRadius: 26,
    width: 340
  },
  actionDetail: {
    color: "#94a3b8",
    fontSize: 19,
    marginTop: 8
  },
  actionLabel: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 14
  },
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
  icon: {
    borderRadius: 7,
    height: 14,
    width: 54
  },
  instructions: {
    color: "#67e8f9",
    fontSize: 17,
    fontWeight: "800",
    left: 48,
    letterSpacing: 4,
    position: "absolute",
    top: 20
  },
  pointer: {
    backgroundColor: "#f8fafc",
    borderColor: "#0f172a",
    borderRadius: 10,
    borderWidth: 3,
    height: 20,
    position: "absolute",
    shadowColor: "#67e8f9",
    shadowOpacity: 1,
    shadowRadius: 15,
    width: 20
  },
  pointerHalo: {
    borderColor: "rgba(103, 232, 249, 0.26)",
    borderRadius: 46,
    borderWidth: 2,
    height: 92,
    position: "absolute",
    width: 92
  }
});
