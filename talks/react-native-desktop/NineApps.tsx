import { FocusRegion, SceneMotionView, SharedElement, usePresentationValue, type PresentationTemplateProps } from "@legend-apps/presentation";
import { useEffect, useRef, type ReactNode } from "react";
import { DeckBackground } from "./DeckBackground";
import { detailCamera, tourStep } from "./NineAppsTour";
import { MovingTitle } from "./MovingTitle";
import { Image, Text, View } from "react-native";
import { appOrder, type AppId, type SceneMode } from "./NineAppsGeometry";

import { WebView } from "react-native-webview";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import rnVideoPage from "./rnconnection-assets/react-native-scroll-proof.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import rnPoster from "./rnconnection-assets/react-native-scroll-proof.jpg";

import { AppCarousel } from "./AppCarousel";

const videoSource = { uri: rnVideoPage };
const videoReadAccess = rnVideoPage.slice(0, rnVideoPage.lastIndexOf("/") + 1);

function ReactNativeRecording({ playing }: { playing: boolean }) {
  const player = useRef<WebView>(null);
  const syncPlayback = () => player.current?.injectJavaScript(
    `(() => { const video = document.querySelector('video'); if (video) { ${playing ? "video.play().catch(() => {});" : "video.pause();"} } })(); true;`,
  );
  // Synchronize an external media player, without replacing it on step changes.
  useEffect(syncPlayback, [playing]);
  return <>
    <Image source={{ uri: rnPoster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
    <WebView ref={player} source={videoSource} allowingReadAccessToURL={videoReadAccess}
      originWhitelist={["file://*"]} mediaPlaybackRequiresUserAction={false} allowsInlineMediaPlayback
      onLoadEnd={syncPlayback}
      containerStyle={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      scrollEnabled={false} style={{ flex: 1, backgroundColor: "#101e30" }} />
  </>;
}

const names: Record<AppId, string> = {
  "react-native": "React Native", appkit: "AppKit", swiftui: "SwiftUI", electron: "Electron",
  tauri: "Tauri", deno: "Deno", compose: "Compose Multiplatform", flutter: "Flutter", gpui: "GPUI",
};
// Add deck-local image imports here when the final captures arrive.
// The RN still should match the video's last frame for a seamless handoff.
const screenshots: Partial<Record<AppId, string>> = { "react-native": rnPoster };

// Full-stage template avoids the standard Markdown content padding.
export default function NineAppsFrame({ children }: PresentationTemplateProps) {
  return <><DeckBackground /><View style={{ flex: 1 }}>{children}</View></>;
}

export function NineApps({ mode, children }: { mode: SceneMode; children?: ReactNode }) {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  const tour = tourStep(step);
  const selected = mode === "filmstrip" ? appOrder.indexOf(tour.app) : 0;
  const camera = detailCamera(mode === "filmstrip" ? tour.detail : "app", tour.app);
  return <FocusRegion id="nine-apps-stage" style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    {mode !== "filmstrip" && <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: 1 }} duration={650} style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <MovingTitle>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>AI Chat History</Text>
      </MovingTitle>
    </SceneMotionView>}
    <SceneMotionView pose={camera} duration={650} style={{ width: 1920, height: 1080 }}>
    <AppCarousel items={appOrder} position={selected} mode={mode} renderCard={(id, card) => {
      const { captionHeight } = card;
      const uri = screenshots[id];
      return (
        <SharedElement id={`nine-app-${id}`} style={{ flex: 1 }}>
          <View style={{ height: captionHeight, minHeight: 24, justifyContent: "center", alignItems: "center", opacity: mode === "hero" ? 0 : 1 }}>
            <Text style={{ fontSize: Math.max(17, card.width * 0.027), fontWeight: "600", color: "#f1f5f9" }}>{names[id]}</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2,
            borderColor: id === "react-native" ? "#67e8f9" : "#33465e", backgroundColor: "#101e30" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14253a" }}>
              {id === "react-native" && !isPreview && mode !== "grid" ?
                <ReactNativeRecording playing={phase === "playing" && (mode === "hero" || selected === 0)} />
              : uri ? <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} /> : <>
                <View style={{ position: "absolute", left: "2%", top: "2%", width: "26%", height: "94%", borderRadius: 12, borderWidth: 1, borderColor: "#94a3b8", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(12, card.width * 0.018) }}>Sidebar</Text>
                </View>
                <Text style={{ position: "absolute", left: "33%", top: "30%", color: "#f1f5f9", fontSize: Math.max(14, card.width * 0.022) }}>{mode === "hero" ? "VIDEO" : "SCREENSHOT"}{"\n"}Capture pending</Text>
                <View style={{ position: "absolute", left: "30%", top: "77%", width: "66%", height: "21%", borderRadius: 12, borderWidth: 1, borderColor: "#94a3b8", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#f1f5f9", fontSize: Math.max(12, card.width * 0.018) }}>Composer</Text>
                </View>
              </>}
            </View>
          </View>
        </SharedElement>
      );
    }} />
    </SceneMotionView>
    {mode === "filmstrip" && tour.detail === "takeover" && <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 3000 }}>{children}</View>}
  </FocusRegion>;
}
