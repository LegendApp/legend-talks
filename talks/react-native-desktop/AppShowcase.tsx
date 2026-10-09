import { AppCarousel } from "slides:media/AppCarousel";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { useState } from "react";
import { makeMutable } from "react-native-reanimated";
import { Image, Text, View } from "react-native";
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
import diffLaunch from "./rnconnection-assets/app-recordings/diff-launch.html";
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
const appMedia: Record<string, { page?: string; poster: string; launch?: string }> = {
  "Legend Photos": { page: photosPage, poster: photosPoster },
  "Legend Music": { page: musicPage, poster: musicPoster },
  "Chat History": { page: chat_historyPage, poster: chat_historyPoster },
  "Code": { page: codePage, poster: codePoster },
  "Diff": { page: diffPage, poster: diffPoster, launch: diffLaunch },
  "Markdown": { poster: markdownPoster },
};

export function AppShowcase({ apps, title, launchDemo = false }: { apps: string[]; title: string; launchDemo?: boolean }) {
  const step = usePresentationValue("stepIndex");
  const phase = usePresentationValue("playbackPhase");
  const isPreview = usePresentationValue("isPreview");
  const launchIndex = launchDemo ? apps.findIndex(name => appMedia[name]?.launch) : -1;
  const position = launchIndex >= 0 && step > launchIndex ? step - 1 : step;
  const [launchPosition] = useState(() => makeMutable(0));
  const hasMedia = apps.every(name => Boolean(appMedia[name]));
  return <View style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    {!hasMedia && <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </MovingTitle>}
    <AppCarousel cardWidth={hasMedia ? 1600 : 1180} items={apps} position={position} getBlurPoster={name => appMedia[name]?.poster} getBlurPosterCaption={name => name} renderCard={(name, card) => {
      const media = appMedia[name];
      if (!media) return <MediaSlot label={name} height={card.height} />;
      const launch = launchIndex >= 0 && step === launchIndex + 1 ? media.launch : undefined;
      return <View style={{ flex: 1 }}>
        <View style={{ height: card.captionHeight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#f8fafc", fontSize: card.width * 0.035, fontWeight: "600" }}>{name}</Text>
        </View>
        <View style={{ flex: 1, overflow: "hidden" }}>
          <SceneMotionView duration={500} style={{ flex: 1 }} pose={{
            x: launch ? -card.width * 0.225 : 0,
            y: launch ? -(card.height - card.captionHeight) * 0.25 : 0,
            scaleX: launch ? 1.5 : 1, scaleY: launch ? 1.5 : 1,
          }}>
            {isPreview || !media.page ? <Image source={{ uri: media.poster }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
              : <LocalRecording key={launch ? "launch" : "normal"} page={launch ?? media.page} poster={media.poster} extension="mov" transparent
                  position={launch ? launchPosition : undefined} playing={phase === "playing" && apps[position] === name} />}
          </SceneMotionView>
        </View>
      </View>;
    }} />
  </View>;
}
