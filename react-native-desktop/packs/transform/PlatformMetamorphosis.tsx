import { FrameText, FrameView } from "../shared/FrameView";
import { StyleSheet, Text, View } from "react-native";
import { effectAmount, effectDuration, loopTime, type EffectProfileProps } from "../shared/effectProfile";
import { smooth, useEffectTime } from "../shared/effectRuntime";
const conversations = ["Desktop support", "Native UI", "Ship one product"];
export function PlatformMetamorphosis({
  durationSeconds,
  intensity = "heavy",
  previewProgress = 0.78,
  tempo = "fast"
}: EffectProfileProps) {
  const duration = effectDuration(tempo, durationSeconds, 4.8, 2.7);
  const amount = effectAmount(intensity, 0.45, 1);
  const time = useEffectTime(duration * previewProgress);
  return <View style={styles.frame}>
      <View style={styles.labels}>
        <Text style={styles.label}>ONE COMPONENT TREE</Text>
        <Text style={styles.arrow}>→</Text>
        <FrameText frameStyle={() => {
        "worklet";

        return [styles.label, {
          opacity: 0.35 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 0.65
        }];
      }}>DESKTOP-SHAPED</FrameText>
      </View>
      <FrameView frameStyle={() => {
      "worklet";

      return [styles.device, {
        height: 500 - smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 38,
        transform: [{
          rotate: `${(1 - smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration))) * -2.2 * amount + Math.sin(smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * Math.PI) * amount * 0.35}deg`
        }, {
          scale: 0.96 + Math.sin(smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * Math.PI) * amount * 0.035
        }],
        width: 390 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 1050
      }];
    }}>
        <FrameView frameStyle={() => {
        "worklet";

        return [styles.titlebar, {
          opacity: 0.25 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 0.75
        }];
      }}>
          <View style={styles.traffic}><View style={[styles.dot, {
            backgroundColor: "#fb7185"
          }]} /><View style={[styles.dot, {
            backgroundColor: "#fbbf24"
          }]} /><View style={[styles.dot, {
            backgroundColor: "#4ade80"
          }]} /></View>
          <Text style={styles.windowTitle}>Chat History</Text>
          <FrameView frameStyle={() => {
          "worklet";

          return [styles.toolbar, {
            opacity: smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration))
          }];
        }}><Text style={styles.toolbarText}>⌘K</Text></FrameView>
        </FrameView>
        <View style={styles.body}>
          <FrameView frameStyle={() => {
          "worklet";

          return [styles.sidebar, {
            width: 90 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 330
          }];
        }}>
            <FrameText frameStyle={() => {
            "worklet";

            return [styles.sidebarTitle, {
              opacity: smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration))
            }];
          }}>CONVERSATIONS</FrameText>
            {conversations.map((conversation, index) => <View key={conversation} style={[styles.row, index === 1 && styles.selected]}>
                <FrameView frameStyle={() => {
              "worklet";

              return [styles.avatar, {
                opacity: 0.35 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 0.65
              }];
            }} />
                <FrameText numberOfLines={1} frameStyle={() => {
              "worklet";

              return [styles.rowText, {
                opacity: smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration))
              }];
            }}>{conversation}</FrameText>
              </View>)}
          </FrameView>
          <FrameView frameStyle={() => {
          "worklet";

          return [styles.content, {
            opacity: 0.35 + smooth(Math.min(1, loopTime(time.value, duration, 1.2) / duration)) * 0.65
          }];
        }}>
            <Text style={styles.you}>YOU</Text>
            <Text style={styles.heading}>Can this become a desktop app?</Text>
            <View style={styles.reply}><Text style={styles.replyText}>It already is one.</Text></View>
          </FrameView>
        </View>
      </FrameView>
      <Text style={styles.caption}>The layout changes shape. The component model stays familiar.</Text>
    </View>;
}
const styles = StyleSheet.create({
  arrow: {
    color: "#67e8f9",
    fontSize: 28
  },
  avatar: {
    backgroundColor: "#67e8f9",
    borderRadius: 10,
    height: 20,
    width: 20
  },
  body: {
    flex: 1,
    flexDirection: "row"
  },
  caption: {
    bottom: 2,
    color: "#94a3b8",
    fontSize: 24,
    left: 40,
    position: "absolute"
  },
  content: {
    flex: 1,
    padding: 40
  },
  device: {
    alignSelf: "center",
    backgroundColor: "#020617",
    borderColor: "#67e8f9",
    borderRadius: 30,
    borderWidth: 2,
    marginTop: 18,
    overflow: "hidden",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.3,
    shadowRadius: 28
  },
  dot: {
    borderRadius: 7,
    height: 14,
    width: 14
  },
  frame: {
    height: 580,
    overflow: "hidden",
    position: "relative",
    width: 1680
  },
  heading: {
    color: "#f8fafc",
    fontSize: 38,
    fontWeight: "700",
    marginTop: 18
  },
  label: {
    color: "#a5f3fc",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 3
  },
  labels: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center"
  },
  reply: {
    backgroundColor: "#164e63",
    borderRadius: 18,
    marginTop: 42,
    padding: 26,
    width: "78%"
  },
  replyText: {
    color: "#ecfeff",
    fontSize: 29
  },
  row: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 14,
    height: 58,
    marginBottom: 10,
    paddingHorizontal: 18
  },
  rowText: {
    color: "#e2e8f0",
    fontSize: 21
  },
  selected: {
    backgroundColor: "#155e75"
  },
  sidebar: {
    backgroundColor: "#111c30",
    paddingHorizontal: 18,
    paddingTop: 28
  },
  sidebarTitle: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 20
  },
  titlebar: {
    alignItems: "center",
    borderBottomColor: "#334155",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 62,
    paddingHorizontal: 22
  },
  toolbar: {
    backgroundColor: "#172033",
    borderColor: "#475569",
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  toolbarText: {
    color: "#cbd5e1",
    fontSize: 14
  },
  traffic: {
    flexDirection: "row",
    gap: 8
  },
  windowTitle: {
    color: "#cbd5e1",
    fontSize: 19,
    marginLeft: 18
  },
  you: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 3
  }
});
