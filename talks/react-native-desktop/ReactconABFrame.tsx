import type { PresentationTemplateProps } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import Frame from "./RNConnection";
import FullStageFrame from "./NineApps";

export default function ReactconABFrame(props: PresentationTemplateProps) {
  const Surface = props.slide.reviewFullStage === true ? FullStageFrame : Frame;
  const variant = props.slide.animationVariant === "B" ? "B" : "A";
  return <View style={{ flex: 1 }}>
    <Surface {...props} />
    <View pointerEvents="none" style={{ position: "absolute", top: 12, right: 24, zIndex: 10000,
      width: 94, height: 94, borderRadius: 20, alignItems: "center", justifyContent: "center",
      borderWidth: 2, borderColor: variant === "B" ? "#67e8f9" : "#ffffff88", backgroundColor: "#050a12ee" }}>
      <Text accessibilityLabel={`Animation variant ${variant}`} style={{ color: variant === "B" ? "#67e8f9" : "white",
        fontSize: 72, lineHeight: 86, fontWeight: "800" }}>{variant}</Text>
    </View>
    {props.slide.reviewRemove === true && <View pointerEvents="none" style={{ position: "absolute", top: 8,
      alignSelf: "center", zIndex: 10000, paddingHorizontal: 28, borderRadius: 16, borderWidth: 3,
      borderColor: "#ff3b30", backgroundColor: "#090909ee" }}>
      <Text style={{ color: "#ff3b30", fontSize: 72, lineHeight: 86, fontWeight: "900" }}>REMOVE</Text>
    </View>}
  </View>;
}
