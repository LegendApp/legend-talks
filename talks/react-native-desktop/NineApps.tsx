import { FilmstripMotionView, FocusRegion, SharedElement, type PresentationTemplateProps } from "@legend-apps/presentation";
import { MovingTitle } from "./MovingTitle";
import { Image, Text, View } from "react-native";
import { appCardLayout, appOrder, type AppId, type SceneMode } from "./NineAppsGeometry";

const names: Record<AppId, string> = {
  "react-native": "React Native", appkit: "AppKit", swiftui: "SwiftUI", electron: "Electron",
  tauri: "Tauri", deno: "Deno", compose: "Compose Multiplatform", flutter: "Flutter", gpui: "GPUI",
};
// Add deck-local image imports here when the final captures arrive.
// The RN still should match the video's last frame for a seamless handoff.
const screenshots: Partial<Record<AppId, string>> = {};

// Full-stage template avoids the standard Markdown content padding.
export default function NineAppsFrame({ children }: PresentationTemplateProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}

export function NineApps({ mode }: { mode: SceneMode }) {
  const title = mode === "hero" ? "I built a chat history app." : mode === "grid" ? "Then I built it nine times." : "Same app. Nine implementations.";
  return <FocusRegion id="nine-apps-stage" style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700" }}>{title}</Text>
    </MovingTitle>
    {appOrder.map((id, index) => {
      const card = appCardLayout(index, mode);
      const height = card.width * 0.625;
      const captionHeight = card.width * 0.0625;
      const uri = screenshots[id];
      return <FilmstripMotionView key={id} index={index} count={appOrder.length} enabled={mode === "filmstrip"} style={{ position: "absolute", left: card.x - card.width / 2,
        top: card.y - height / 2, width: card.width, height, zIndex: card.depth }}>
        <SharedElement id={`nine-app-${id}`} style={{ flex: 1 }}>
          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2,
            borderColor: id === "react-native" ? "#67e8f9" : "#33465e", backgroundColor: "#101e30" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14253a" }}>
              {uri ? <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} /> : <>
                <View style={{ width: "78%", height: "64%", borderWidth: 1, borderColor: "#36516d", borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(18, card.width * 0.034), fontWeight: "600" }}>{mode === "hero" && id === "react-native" ? "REACT NATIVE VIDEO" : names[id]}</Text>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(13, card.width * 0.018), marginTop: 10 }}>Media placeholder</Text>
                </View>
              </>}
            </View>
            <View style={{ height: captionHeight, minHeight: 24, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: Math.max(17, card.width * 0.027), fontWeight: "600", color: id === "react-native" ? "#67e8f9" : "#f1f5f9" }}>{names[id]}</Text>
            </View>
          </View>
        </SharedElement>
      </FilmstripMotionView>;
    })}
  </FocusRegion>;
}
