import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "react-native";
import { WebView } from "react-native-webview";

export function LocalRecording({ page, poster, playing, transparent = false }: { page: string; poster: string; playing: boolean; transparent?: boolean }) {
  const backgroundColor = transparent ? "transparent" : "#101e30";
  const videoReadAccess = page.slice(0, page.lastIndexOf("/") + 1);
  const player = useRef<WebView>(null);
  const [frameReady, setFrameReady] = useState(false);
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
      onLoadStart={() => setFrameReady(false)}
      onMessage={event => { if (event.nativeEvent.data === "first-video-frame") setFrameReady(true); }}
      onError={() => setFrameReady(false)}
      onLoadEnd={syncPlayback}
      containerStyle={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      scrollEnabled={false} style={{ flex: 1, backgroundColor }} />
    {!frameReady && <Image source={{ uri: poster }} resizeMode="contain"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 1, backgroundColor }} />}
  </>;
}
