import { FilmstripMotionView } from "./FilmstripMotionView";
import { ProgressivePreparation, SceneMotionView, usePlaybackTween, usePresentationValue } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import { Image, Text, View } from "react-native";
import { appCardLayout, type SceneMode } from "./NineAppsGeometry";
import { MediaSlot } from "./RNConnectionVisuals";
import { MovingTitle } from "./MovingTitle";


import { LocalRecording } from "./LocalRecording";
// @ts-ignore Local media resolved by the deck compiler.
import chat_historyPage from "./rnconnection-assets/app-recordings/chat-history.html";
// @ts-ignore Local media resolved by the deck compiler.
import chat_historyPoster from "./rnconnection-assets/app-recordings/chat-history.png";
// @ts-ignore Local media resolved by the deck compiler.
import codePage from "./rnconnection-assets/app-recordings/code.html";
// @ts-ignore Local media resolved by the deck compiler.
import codePoster from "./rnconnection-assets/app-recordings/code.png";
// @ts-ignore Local media resolved by the deck compiler.
import diffPage from "./rnconnection-assets/app-recordings/diff.html";
// @ts-ignore Local media resolved by the deck compiler.
import diffPoster from "./rnconnection-assets/app-recordings/diff.png";
// @ts-ignore Local media resolved by the deck compiler.
import photosPage from "./rnconnection-assets/app-recordings/photos.html";
// @ts-ignore Local media resolved by the deck compiler.
import photosPoster from "./rnconnection-assets/app-recordings/photos.png";
// @ts-ignore Local media resolved by the deck compiler.
import musicPage from "./rnconnection-assets/app-recordings/music.html";
// @ts-ignore Local media resolved by the deck compiler.
import musicPoster from "./rnconnection-assets/app-recordings/music.png";
// @ts-ignore Local media resolved by the deck compiler.
import markdownPoster from "./rnconnection-assets/app-recordings/markdown.png";
const appMedia: Record<string, { page?: string; poster: string }> = {
  "Legend Photos": { page: photosPage, poster: photosPoster },
  "Legend Music": { page: musicPage, poster: musicPoster },
  "Chat History": { page: chat_historyPage, poster: chat_historyPoster },
  "Code": { page: codePage, poster: codePoster },
  "Diff": { page: diffPage, poster: diffPoster },
  "Markdown": { poster: markdownPoster },
};

type CardLayout = ReturnType<typeof appCardLayout> & { height: number; captionHeight: number };

/** Shared step-controlled carousel; interpolation and exit motion run on the UI thread. */
export function AppCarousel<T extends string>({ items, position, mode = "filmstrip", cardWidth = 1180, renderCard }: {
  items: readonly T[];
  position: number;
  mode?: SceneMode;
  cardWidth?: number;
  renderCard: (id: T, layout: CardLayout) => ReactNode;
}) {
  const selected = Math.max(0, Math.min(items.length - 1, position));
  const progress = usePlaybackTween({ position: selected }, 500);
  return <ProgressivePreparation>{items.map((id, index) => {
    const card = appCardLayout(index, mode, 0, cardWidth);
    const height = cardWidth * 0.625;
    return <FilmstripMotionView key={id} index={index} enabled={mode === "filmstrip"} progress={progress}
      style={{ position: "absolute", left: 960 - cardWidth / 2, top: 555 - height / 2,
        width: cardWidth, height, zIndex: card.depth }}>
      <SceneMotionView duration={550} pose={{ x: card.x - (960 + index * 900), y: card.y - 555,
        scaleX: card.width / cardWidth, scaleY: card.width / cardWidth }} style={{ flex: 1 }}>
        {renderCard(id, { ...card, width: cardWidth, height, captionHeight: cardWidth * 0.0625 })}
      </SceneMotionView>
    </FilmstripMotionView>;
  })}</ProgressivePreparation>;
}

export function AppShowcase({ apps, title }: { apps: string[]; title: string }) {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  const hasMedia = apps.every(name => Boolean(appMedia[name]));
  return <View style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    {!hasMedia && <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </MovingTitle>}
    <AppCarousel cardWidth={hasMedia ? 1600 : 1180} items={apps} position={step} renderCard={(name, card) => {
      const media = appMedia[name];
      if (!media) return <MediaSlot label={name} height={card.height} />;
      return <View style={{ flex: 1 }}>
        <View style={{ height: card.captionHeight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#f8fafc", fontSize: card.width * 0.035, fontWeight: "600" }}>{name}</Text>
        </View>
        <View style={{ flex: 1, overflow: "hidden" }}>
          {isPreview || !media.page ? <Image source={{ uri: media.poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
            : <LocalRecording page={media.page} poster={media.poster} extension="mov" transparent playing={phase === "playing" && apps[step] === name} />}
        </View>
      </View>;
    }} />
  </View>;
}
