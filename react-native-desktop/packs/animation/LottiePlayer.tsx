import { LottiePlayer } from "slides:animation/LottiePlayer";
import type { AnimationObject } from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";
import nativeOrbit from "./native-orbit.json";
export function NativeOrbitLottie() {
  return <View style={styles.frame}>
      <View style={styles.meta}>
        <Text style={styles.eyebrow}>DECK-LOCAL JSON</Text>
        <Text style={styles.title}>One asset. Native vector playback.</Text>
        <Text style={styles.detail}>The slide clock controls progress, preview and replay.</Text>
      </View>
      <View style={styles.stage}>
        <LottiePlayer source={nativeOrbit as AnimationObject} style={styles.animation} />
      </View>
      <Text style={styles.caption}>Generated Lottie JSON rendered by the native macOS runtime.</Text>
    </View>;
}
const styles = StyleSheet.create({
  animation: {
    height: 500,
    width: 980
  },
  caption: {
    bottom: 4,
    color: "#94a3b8",
    fontSize: 24,
    left: 40,
    position: "absolute"
  },
  detail: {
    color: "#94a3b8",
    fontSize: 24,
    lineHeight: 34,
    marginTop: 22,
    width: 440
  },
  eyebrow: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4
  },
  frame: {
    flexDirection: "row",
    height: 580,
    paddingHorizontal: 40,
    position: "relative",
    width: 1680
  },
  meta: {
    justifyContent: "center",
    paddingBottom: 42,
    width: 500
  },
  stage: {
    alignItems: "center",
    height: 520,
    justifyContent: "center",
    width: 1100
  },
  title: {
    color: "#f8fafc",
    fontSize: 50,
    fontWeight: "700",
    lineHeight: 58,
    marginTop: 18,
    width: 470
  }
});
