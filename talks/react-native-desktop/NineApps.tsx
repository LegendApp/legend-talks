import { FilmstripMotionView, FocusRegion, SceneMotionView, SharedElement, usePresentationValue, type PresentationTemplateProps } from "@legend-apps/presentation";
import { FakeGlassTakeover } from "./FakeGlassTakeover";
import { detailCamera, renderingGroup, tourStep } from "./NineAppsTour";
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
  const step = usePresentationValue("stepIndex");
  const tour = tourStep(step);
  const selected = mode === "filmstrip" ? appOrder.indexOf(tour.app) : 0;
  const camera = detailCamera(mode === "filmstrip" ? tour.detail : "app");
  const title = mode === "hero" ? "I built a chat history app" : mode === "grid" ? "Then I built it nine times" : "Same app. Nine implementations.";
  return <FocusRegion id="nine-apps-stage" style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </MovingTitle>
    {mode === "filmstrip" && <Text style={{ position: "absolute", left: 112, top: 145, width: 1696, textAlign: "center", color: "#f1f5f9", fontSize: 28, zIndex: 2000 }}>{names[tour.app]} · {renderingGroup(tour.app)}{tour.detail === "sidebar" ? " · Sidebar" : tour.detail === "composer" ? " · Composer" : ""}</Text>}
    <SceneMotionView pose={camera} duration={650} style={{ width: 1920, height: 1080 }}>
    {appOrder.map((id, index) => {
      const card = appCardLayout(index, mode);
      const height = card.width * 0.625;
      const captionHeight = card.width * 0.0625;
      const uri = screenshots[id];
      return <FilmstripMotionView key={id} index={index} count={appOrder.length} enabled={mode === "filmstrip"} position={selected} style={{ position: "absolute", left: card.x - card.width / 2,
        top: card.y - height / 2, width: card.width, height, zIndex: card.depth }}>
        <SharedElement id={`nine-app-${id}`} style={{ flex: 1 }}>
          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2,
            borderColor: id === "react-native" ? "#67e8f9" : "#33465e", backgroundColor: "#101e30" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14253a" }}>
              {uri ? <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} /> : <>
                <View style={{ position: "absolute", left: "2%", top: "2%", width: "26%", height: "94%", borderRadius: 12, borderWidth: 1, borderColor: "#94a3b8", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(12, card.width * 0.018) }}>Sidebar</Text>
                </View>
                <Text style={{ position: "absolute", left: "33%", top: "30%", color: "#f1f5f9", fontSize: Math.max(14, card.width * 0.022) }}>{mode === "hero" ? "REACT NATIVE VIDEO" : names[id]}{"\n"}Capture pending</Text>
                <View style={{ position: "absolute", left: "30%", top: "77%", width: "66%", height: "21%", borderRadius: 12, borderWidth: 1, borderColor: "#94a3b8", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(12, card.width * 0.018) }}>Composer</Text>
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
    </SceneMotionView>
    {mode === "filmstrip" && <FakeGlassTakeover visible={tour.detail === "fake" || tour.detail === "takeover"} expanded={tour.detail === "takeover"} />}
  </FocusRegion>;
}
