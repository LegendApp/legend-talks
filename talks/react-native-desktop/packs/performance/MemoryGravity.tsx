import { FrameView } from "../shared/FrameView";
import { StyleSheet, Text, View } from "react-native";
import { stage, useEffectTime } from "../shared/effectRuntime";
type MemoryGravityProps = {
  cycleSeconds?: number;
  heavyLabel?: string;
  heavyMemory?: number;
  lightLabel?: string;
  lightMemory?: number;
};
function MemoryColumn({
  color,
  cycleSeconds,
  label,
  memory,
  weight
}: {
  color: string;
  cycleSeconds: number;
  label: string;
  memory: number;
  weight: "heavy" | "light";
}) {
  const heavy = weight === "heavy";
  const time = useEffectTime(4.8);
  const travel = heavy ? 190 : 72;
  const cardWidth = heavy ? 560 : 410;
  return <View style={styles.column}>
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.massCard, {
        borderColor: color,
        top: 18 + stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * travel,
        width: cardWidth,
        shadowColor: color,
        transform: [{
          rotate: heavy ? `${stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * 1.4}deg` : `${-stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * 0.7}deg`
        }]
      }];
    }}>
        <Text style={styles.appLabel}>{label}</Text>
        <Text style={[styles.memoryValue, {
        color
      }]}>{memory.toFixed(0)} MB</Text>
      </FrameView>
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.pressureGlow, {
        backgroundColor: color,
        height: 18 + stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * (heavy ? 150 : 42) * 0.34,
        opacity: 0.12 + stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * 0.26,
        width: cardWidth * 0.9
      }];
    }} />
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.spring, {
        height: 170 - stage(time.value % cycleSeconds, 0.55, heavy ? 2.25 : 0.7) * (heavy ? 150 : 42),
        borderColor: color
      }];
    }}>
        {Array.from({
        length: 7
      }, (_, index) => <View key={index} style={[styles.springBand, {
        backgroundColor: color,
        opacity: 0.22 + index * 0.06
      }]} />)}
      </FrameView>
      <View style={[styles.floor, {
      backgroundColor: color,
      width: cardWidth + 90
    }]} />
    </View>;
}
export function MemoryGravity({
  cycleSeconds = 5.8,
  heavyLabel = "Electron",
  heavyMemory = 628.9,
  lightLabel = "React Native",
  lightMemory = 101.7
}: MemoryGravityProps) {
  const time = useEffectTime(4.8);
  return <FrameView frameStyle={() => {
    "worklet";

    return [styles.frame, {
      opacity: 1 - stage(time.value % cycleSeconds, cycleSeconds - 0.45, 0.34)
    }];
  }}>
      <View style={styles.header}>
        <Text style={styles.measure}>MEASURED MEMORY, SHOWN AS WEIGHT</Text>
        <Text style={styles.scale}>Same initial Chat History workload</Text>
      </View>
      <View style={styles.columns}>
        <MemoryColumn color="#67e8f9" cycleSeconds={cycleSeconds} label={lightLabel} memory={lightMemory} weight="light" />
        <MemoryColumn color="#818cf8" cycleSeconds={cycleSeconds} label={heavyLabel} memory={heavyMemory} weight="heavy" />
      </View>
      <Text style={styles.caption}>A physical metaphor for the measured footprint.</Text>
    </FrameView>;
}
const styles = StyleSheet.create({
  appLabel: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700"
  },
  caption: {
    bottom: 4,
    color: "#94a3b8",
    fontSize: 24,
    left: 40,
    position: "absolute"
  },
  column: {
    alignItems: "center",
    height: 450,
    position: "relative",
    width: 760
  },
  columns: {
    flexDirection: "row",
    gap: 60,
    justifyContent: "center",
    marginTop: 18
  },
  floor: {
    borderRadius: 3,
    bottom: 20,
    height: 7,
    position: "absolute"
  },
  frame: {
    height: 580,
    paddingHorizontal: 40,
    position: "relative",
    width: 1680
  },
  header: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 40,
    paddingTop: 22
  },
  massCard: {
    backgroundColor: "#07101f",
    borderRadius: 24,
    borderWidth: 2,
    height: 150,
    paddingHorizontal: 30,
    paddingVertical: 22,
    position: "absolute",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    zIndex: 2
  },
  measure: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4
  },
  memoryValue: {
    fontSize: 52,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    marginTop: 10
  },
  pressureGlow: {
    borderRadius: 80,
    bottom: 183,
    position: "absolute"
  },
  scale: {
    color: "#64748b",
    fontSize: 18
  },
  spring: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    bottom: 27,
    justifyContent: "space-around",
    paddingHorizontal: 8,
    position: "absolute",
    width: 170
  },
  springBand: {
    borderRadius: 2,
    height: 4,
    width: "100%"
  }
});
