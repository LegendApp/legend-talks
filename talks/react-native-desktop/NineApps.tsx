import { CarouselBlurView } from "./CarouselBlurView";
import { usePlaybackTween, FocusRegion, SceneMotionView, SharedElement, usePresentationValue, type PresentationTemplateProps } from "@legend-apps/presentation";
import { Canvas, Image as SkiaImage } from "@shopify/react-native-skia";
import { useMemo, type ReactNode } from "react";
import { RecordingFrameProvider, useRecordingFrame } from "./RecordingFrameProvider";
import { ComposerGlassTakeover } from "./ComposerGlassTakeover";
import { DeckBackground } from "./DeckBackground";
import { detailCamera, shortTourSteps, tourStep, tourSteps } from "./NineAppsTour";
import { MovingTitle } from "./MovingTitle";
import { Image, Text, View } from "react-native";
import { appOrder, appCardLayout, filmstripLeft, filmstripWidth, type AppId, type SceneMode } from "./NineAppsGeometry";

import { LocalRecording } from "./LocalRecording";
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


const names: Record<AppId, string> = {
  "react-native": "React Native", appkit: "AppKit", swiftui: "SwiftUI", electron: "Electron",
  tauri: "Tauri", deno: "Deno", compose: "Compose Multiplatform", flutter: "Flutter", gpui: "GPUI",
};
// Full-stage template avoids the standard Markdown content padding.
export default function NineAppsFrame({ children }: PresentationTemplateProps) {
  return <><DeckBackground /><View style={{ flex: 1 }}>{children}</View></>;
}

function GpuiPlayback({ children, mode: requestedMode, tour: requestedTour }: {
  children: ReactNode; mode?: SceneMode; tour: "full" | "short";
}) {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  const mode = requestedMode ?? (step === 0 ? "hero" : step === 1 ? "grid" : "filmstrip");
  const tour = tourStep(requestedMode ? step : Math.max(0, step - 2), requestedTour === "short" ? shortTourSteps : tourSteps);
  const playing = mode === "filmstrip" && phase === "playing" && tour.app === "gpui";
  return <RecordingFrameProvider source={gpuiPage.replace(/\.html$/, ".mp4")} playing={playing} isPreview={isPreview}>{children}</RecordingFrameProvider>;
}

export function NineApps({ mode, tour = "full" }: { mode?: SceneMode; tour?: "full" | "short" }) {
  const content = useMemo(() => <NineAppsContent mode={mode} tour={tour} />, [mode, tour]);
  return <GpuiPlayback mode={mode} tour={tour}>{content}</GpuiPlayback>;
}

function NineAppsContent({ mode: requestedMode, tour: requestedTour = "full" }: { mode?: SceneMode; tour?: "full" | "short" }) {
  const step = usePresentationValue("stepIndex");
  const mode = requestedMode ?? (step === 0 ? "hero" : step === 1 ? "grid" : "filmstrip");
  const tourIndex = requestedMode ? step : Math.max(0, step - 2);
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  const tour = tourStep(tourIndex, requestedTour === "short" ? shortTourSteps : tourSteps);
  const selected = mode === "filmstrip" ? appOrder.indexOf(tour.app) : 0;
  const gpuiFrame = useRecordingFrame();
  const titleProgress = usePlaybackTween({ position: selected }, 500);
  const camera = detailCamera(mode === "filmstrip" ? tour.detail : "app", tour.app);
  return <FocusRegion id="nine-apps-stage" style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    {mode !== "filmstrip" && <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: 1 }} duration={650} style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <MovingTitle>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>AI Chat History</Text>
      </MovingTitle>
    </SceneMotionView>}
    <View style={{ width: 1920, height: 1080 }}>
    <SceneMotionView pose={camera} duration={650} style={{ width: 1920, height: 1080 }}>
    <AppCarousel cardWidth={filmstripWidth} items={appOrder} position={selected} mode={mode}
      renderCard={(id, card) => {
      const { captionHeight } = card;
      const uri = recordings[id].poster;
      return (
        <SharedElement id={`nine-app-${id}`} style={{ flex: 1 }}>
          <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: mode === "grid" ? 1 : 0 }} duration={650}
            style={{ height: captionHeight, minHeight: 24, justifyContent: "center", alignItems: "center" }}>
            {mode === "grid" && <Text style={{ fontSize: Math.max(17, card.width * 0.027), fontWeight: "700", color: "#f1f5f9" }}>{names[id]}</Text>}
          </SceneMotionView>
          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#14253a" }}>
              {!isPreview && id === "gpui" ? <>
                <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
                <Canvas style={{ position: "absolute", left: 0, top: 0, width: card.width, height: card.height - captionHeight }}>
                  <SkiaImage image={gpuiFrame} x={0} y={0} width={card.width} height={card.height - captionHeight} fit="contain" />
                </Canvas>
              </> : !isPreview ?
                <LocalRecording {...recordings[id]} playing={mode !== "grid" && phase === "playing" && id === appOrder[selected] && tour.detail !== "takeover"} />
              : <Image source={{ uri }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />}
            </View>
          </View>
        </SharedElement>
      );
    }} />
    {mode === "filmstrip" && appOrder.map((id, index) => {
      const card = appCardLayout(index, mode, selected);
      const scale = card.width / filmstripWidth;
      // Keep text laid out onstage and blur it with the same focus curve as the video.
      return <SceneMotionView key={`title-${id}`} initialPose={{ opacity: 0 }} duration={500}
        pose={{ x: card.x - 960, y: (filmstripWidth - card.width) * 0.28125,
          scaleX: scale, scaleY: scale, opacity: card.opacity }}
        style={{ position: "absolute", left: filmstripLeft, top: 67.5, width: filmstripWidth,
          height: 97.5, justifyContent: "center", alignItems: "center", zIndex: card.depth * 10 + 1 }}>
        <CarouselBlurView progress={titleProgress} index={index} enabled>
        <View style={{ width: filmstripWidth, flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text numberOfLines={1} style={{ color: "#f8fafc", fontSize: 64, lineHeight: 78,
          fontWeight: "700", textAlign: "center" }}>{names[id]}</Text>
        </View>
        </CarouselBlurView>
      </SceneMotionView>;
    })}
    </SceneMotionView>
    </View>
    {mode === "filmstrip" && tour.detail === "takeover" && <ComposerGlassTakeover frame={gpuiFrame} />}
  </FocusRegion>;
}
