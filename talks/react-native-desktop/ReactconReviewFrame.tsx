import type { PresentationTemplateProps } from "@legend-apps/presentation";
import { StyleSheet, Text, View } from "react-native";
import RNConnectionFrame from "./RNConnection";
import NineAppsFrame from "./NineApps";

/** Review labels stay above the original slide without changing its layout. */
export default function ReactconReviewFrame(props: PresentationTemplateProps) {
  const Frame = props.slide.reviewFullStage === true ? NineAppsFrame : RNConnectionFrame;
  return <View style={styles.frame}>
    <Frame {...props} />
    {props.slide.reviewRemove === true && <View pointerEvents="none" style={styles.marker}>
      <Text style={styles.label}>REMOVE</Text>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  marker: {
    position: "absolute", top: 8, alignSelf: "center", zIndex: 10000,
    paddingHorizontal: 28, borderRadius: 16, borderWidth: 3,
    borderColor: "#ff3b30", backgroundColor: "#090909ee",
  },
  label: { color: "#ff3b30", fontSize: 72, lineHeight: 86, fontWeight: "900" },
});
