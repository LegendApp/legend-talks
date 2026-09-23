import { FilmstripMotionView, usePresentationValue } from "@legend-apps/presentation";
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
const appRecordings: Record<string, { page: string; poster: string }> = {
  "Chat History": { page: chat_historyPage, poster: chat_historyPoster },
  "Code": { page: codePage, poster: codePoster },
  "Diff": { page: diffPage, poster: diffPoster },
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
  return <>{items.map((id, index) => {
    const card = appCardLayout(index, mode, 0, cardWidth);
    const height = card.width * 0.625;
    return <FilmstripMotionView key={id} index={index} count={items.length} enabled={mode === "filmstrip"} position={position}
      style={{ position: "absolute", left: card.x - card.width / 2, top: card.y - height / 2,
        width: card.width, height, zIndex: card.depth }}>
      {renderCard(id, { ...card, height, captionHeight: card.width * 0.0625 })}
    </FilmstripMotionView>;
  })}</>;
}

export function AppShowcase({ apps, title }: { apps: string[]; title: string }) {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  return <View style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </MovingTitle>
    <AppCarousel items={apps} position={step} renderCard={(name, card) => {
      const recording = appRecordings[name];
      if (!recording) return <MediaSlot label={name} height={card.height} />;
      return <View style={{ flex: 1 }}>
        <View style={{ height: card.captionHeight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#f8fafc", fontSize: card.width * 0.035, fontWeight: "600" }}>{name}</Text>
        </View>
        <View style={{ flex: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#101e30" }}>
          {isPreview ? <Image source={{ uri: recording.poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
            : <LocalRecording {...recording} playing={phase === "playing" && apps[step] === name} />}
        </View>
      </View>;
    }} />
  </View>;
}
