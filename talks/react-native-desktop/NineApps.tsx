import { FocusRegion, SceneMotionView, SharedElement, usePresentationValue, type PresentationTemplateProps } from "@legend-apps/presentation";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { DeckBackground } from "./DeckBackground";
import { detailCamera, tourStep } from "./NineAppsTour";
import { MovingTitle } from "./MovingTitle";
import { Image, Text, View } from "react-native";
import { appOrder, filmstripWidth, type AppId, type SceneMode } from "./NineAppsGeometry";

import { WebView } from "react-native-webview";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import react_nativePage from "./rnconnection-assets/framework-recordings/react-native.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import react_nativePoster from "./rnconnection-assets/framework-recordings/react-native.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import appkitPage from "./rnconnection-assets/framework-recordings/appkit.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import appkitPoster from "./rnconnection-assets/framework-recordings/appkit.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import swiftuiPage from "./rnconnection-assets/framework-recordings/swiftui.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import swiftuiPoster from "./rnconnection-assets/framework-recordings/swiftui.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import electronPage from "./rnconnection-assets/framework-recordings/electron.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import electronPoster from "./rnconnection-assets/framework-recordings/electron.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import tauriPage from "./rnconnection-assets/framework-recordings/tauri.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import tauriPoster from "./rnconnection-assets/framework-recordings/tauri.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import deno_cefPage from "./rnconnection-assets/framework-recordings/deno-cef.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import deno_cefPoster from "./rnconnection-assets/framework-recordings/deno-cef.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import composePage from "./rnconnection-assets/framework-recordings/compose.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import composePoster from "./rnconnection-assets/framework-recordings/compose.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import flutterPage from "./rnconnection-assets/framework-recordings/flutter.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import flutterPoster from "./rnconnection-assets/framework-recordings/flutter.png";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import gpuiPage from "./rnconnection-assets/framework-recordings/gpui.html";
// @ts-ignore Deck assets resolve to local file URLs in the deck compiler.
import gpuiPoster from "./rnconnection-assets/framework-recordings/gpui.png";

import { AppCarousel } from "./AppCarousel";

const recordings: Record<AppId, { page: string; poster: string }> = {
  "react-native": { page: react_nativePage, poster: react_nativePoster },
  "appkit": { page: appkitPage, poster: appkitPoster },
  "swiftui": { page: swiftuiPage, poster: swiftuiPoster },
  "electron": { page: electronPage, poster: electronPoster },
  "tauri": { page: tauriPage, poster: tauriPoster },
  "deno": { page: deno_cefPage, poster: deno_cefPoster },
  "compose": { page: composePage, poster: composePoster },
  "flutter": { page: flutterPage, poster: flutterPoster },
  "gpui": { page: gpuiPage, poster: gpuiPoster },
};

function FrameworkRecording({ id, playing }: { id: AppId; playing: boolean }) {
  const { page, poster } = recordings[id];
  const videoReadAccess = page.slice(0, page.lastIndexOf("/") + 1);
  const player = useRef<WebView>(null);
  const source = useMemo(() => ({ uri: page }), [page]);
  const syncPlayback = useCallback(() => player.current?.injectJavaScript(
    `(() => { const video = document.querySelector('video'); if (video) { ${playing ? "video.play().catch(() => {});" : "video.pause();"} } })(); true;`,
  ), [playing]);
  // Synchronize an external media player, without replacing it on step changes.
  useEffect(syncPlayback, [syncPlayback]);
  return <>
    <Image source={{ uri: poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
    <WebView ref={player} source={source} allowingReadAccessToURL={videoReadAccess}
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
    <AppCarousel cardWidth={filmstripWidth} items={appOrder} position={selected} mode={mode}
      renderOverlay={mode === "filmstrip" ? (id, card) => <View pointerEvents="none" collapsable={false}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: card.captionHeight, justifyContent: "center", alignItems: "center", zIndex: 1 }}>
        <Text numberOfLines={1} style={{ color: "#f8fafc", fontSize: 64 * card.width / filmstripWidth,
          lineHeight: 78 * card.width / filmstripWidth, fontWeight: "700", textAlign: "center" }}>{names[id]}</Text>
      </View> : undefined}
      renderCard={(id, card) => {
      const { captionHeight } = card;
      const uri = recordings[id].poster;
      return (
        <SharedElement id={`nine-app-${id}`} style={{ flex: 1 }}>
          <View style={{ height: captionHeight, minHeight: 24, justifyContent: "center", alignItems: "center", opacity: mode === "grid" ? 1 : 0 }}>
            {mode === "grid" && <Text style={{ fontSize: Math.max(17, card.width * 0.027), fontWeight: "700", color: "#f1f5f9" }}>{names[id]}</Text>}
          </View>
          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2,
            borderColor: id === "react-native" ? "#67e8f9" : "#33465e", backgroundColor: "#101e30" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14253a" }}>
              {!isPreview && mode !== "grid" ?
                <FrameworkRecording id={id} playing={phase === "playing" && id === appOrder[selected]} />
              : <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />}
            </View>
          </View>
        </SharedElement>
      );
    }} />
    </SceneMotionView>
    {mode === "filmstrip" && tour.detail === "takeover" && <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 3000 }}>{children}</View>}
  </FocusRegion>;
}
