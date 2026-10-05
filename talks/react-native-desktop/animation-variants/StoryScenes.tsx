import { PlaybackKeyframeView, SceneMotionView, SharedElement, usePresentationValue } from "@legend-apps/presentation";
import { Image, Text, View } from "react-native";
import { DirectoryTitle } from "../DirectoryTitle";
import { AppShowcase } from "../AppCarousel";
import { Chart } from "../BenchmarkChart";
import { MovingTitle } from "../MovingTitle";
import { Arrive, Emphasis } from "./Motion";
import directoryScreenshot from "../rnconnection-assets/directory-legend-list.png";
import chatPoster from "../rnconnection-assets/app-recordings/chat-history.png";
import musicIcon from "../rnconnection-assets/music-icon.png";
import photosPoster from "../rnconnection-assets/app-recordings/photos.png";
import codeIcon from "../rnconnection-assets/code-icon.png";
import diffIcon from "../rnconnection-assets/diff-icon.png";
import chatIcon from "../rnconnection-assets/chat-history-icon.png";

const ink = "#f8fafc", cyan = "#67e8f9";
const titleStyle = { color: ink, fontSize: 80, lineHeight: 104, fontWeight: "600" as const, textAlign: "center" as const };

export function DirectoryTitleB() {
  return <View style={{ alignItems: "center" }}><Arrive fromX={-100} fromY={0}><DirectoryTitle /></Arrive>
    <View style={{ width: 1100, height: 130, position: "absolute", top: -8 }}><Emphasis width={1100} height={130} mode={1} clock="slide" /></View>
  </View>;
}

export function DesktopBadges({ delay = 0 }: { delay?: number }) {
  return <View style={{ flexDirection: "row", justifyContent: "center", gap: 50 }}>
    {["macOS", "Windows"].map((name, i) => <SharedElement key={name} id={`desktop-check-${name}`} resize="preserve">
      <Arrive delay={delay + i * 260} fromY={35}><View style={{ width: 350, height: 110, borderRadius: 22,
        backgroundColor: "#102b3b", borderWidth: 2, borderColor: cyan, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <Text style={{ fontSize: 52, color: cyan }}>✓</Text><Text style={{ color: ink, fontSize: 44, fontWeight: "600" }}>{name}</Text>
      </View></Arrive>
    </SharedElement>)}
  </View>;
}

export function DirectoryChecksB() {
  const focused = usePresentationValue("stepIndex") >= 1;
  return <View style={{ width: 1696, height: 880, alignSelf: "center", overflow: "hidden" }}>
    <SceneMotionView duration={1100} initialPose={{ scaleX: 1, scaleY: 1, y: 0 }}
      pose={{ scaleX: focused ? 1.85 : 1, scaleY: focused ? 1.85 : 1, y: focused ? -360 : 0, opacity: focused ? 0.3 : 1 }}
      style={{ position: "absolute", left: (1696 - 1012) / 2, width: 1012, height: 880 }}>
      <Image source={{ uri: directoryScreenshot }} resizeMode="contain" style={{ width: 1012, height: 880 }} />
    </SceneMotionView>
    {focused && <View style={{ position: "absolute", top: 565, width: 1696 }}><DesktopBadges />
      <View style={{ position: "absolute", left: 473, top: 0, width: 350, height: 110 }}><Emphasis width={350} height={110} /></View>
      <View style={{ position: "absolute", left: 873, top: 0, width: 350, height: 110 }}><Arrive delay={300} clock="step"><Emphasis width={350} height={110} /></Arrive></View>
    </View>}
  </View>;
}

export function DiscoveryB() {
  const discovered = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 540 }}>
    <SceneMotionView pose={{ y: discovered ? -180 : 0, opacity: discovered ? 0 : 1 }} duration={650}
      style={{ position: "absolute", top: 210, width: 1696 }}><MovingTitle><Text style={titleStyle}>I came here to test LegendList</Text></MovingTitle></SceneMotionView>
    <SceneMotionView initialPose={{ scaleX: 0.2, scaleY: 0.05, opacity: 0 }}
      pose={{ scaleX: discovered ? 1 : 0.2, scaleY: discovered ? 1 : 0.05, opacity: discovered ? 1 : 0 }} duration={800}
      style={{ position: "absolute", left: 248, top: 0, width: 1200, height: 520, borderRadius: 28, borderWidth: 2, borderColor: cyan, backgroundColor: "#0c1724", overflow: "hidden" }}>
      <Image source={{ uri: photosPoster }} resizeMode="cover" style={{ width: 1200, height: 520, opacity: 0.3 }} />
      <View style={{ position: "absolute", inset: 0, justifyContent: "center" }}><Text style={{ ...titleStyle, color: cyan }}>I found an incredible platform</Text></View>
    </SceneMotionView>
  </View>;
}

const showcaseIcons: Record<string, string> = { "Legend Music": musicIcon, Code: codeIcon, Diff: diffIcon, "Chat History": chatIcon };
export function AppShowcaseB({ apps, title }: { apps: string[]; title: string }) {
  const step = usePresentationValue("stepIndex");
  const name = apps[step] ?? apps[0];
  return <View style={{ width: 1920, height: 1080 }}>
    <PlaybackKeyframeView key={name} clock="step" previewTime={2} keyframes={[
      { time: 0, x: 0, y: 130, opacity: 1 }, { time: 400, x: 0, y: 30, opacity: 1 }, { time: 750, x: 0, y: -220, opacity: 0 },
    ]} style={{ position: "absolute", left: 880, top: 380, width: 160, height: 160, zIndex: 2200 }}>
      {showcaseIcons[name] ? <Image source={{ uri: showcaseIcons[name] }} style={{ width: 160, height: 160 }} />
        : <View style={{ width: 160, height: 160, borderRadius: 32, borderWidth: 2, borderColor: cyan, backgroundColor: "#14364a", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 90 }}>🌄</Text></View>}
    </PlaybackKeyframeView>
    <SceneMotionView key={`app-${name}`} initialPose={{ scaleX: 0.1, scaleY: 0.1, opacity: 0 }} pose={{ scaleX: 1, scaleY: 1, opacity: 1 }} delay={380} duration={650}>
      <AppShowcase apps={apps} title={title} />
    </SceneMotionView>
    <View style={{ position: "absolute", left: 40, bottom: 25, flexDirection: "row", gap: 20 }}>
      {apps.slice(0, step).map(app => showcaseIcons[app] && <Arrive key={app} fromY={-50}>
        <Image source={{ uri: showcaseIcons[app] }} style={{ width: 64, height: 64, opacity: 0.65 }} />
      </Arrive>)}
    </View>
  </View>;
}

export function MeasuredB() {
  const measured = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 520, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: measured ? -80 : 0, opacity: measured ? 0 : 1 }} duration={500} style={{ position: "absolute", top: 190, width: 1696 }}>
      <Text style={titleStyle}>Was I just imagining it?</Text>
    </SceneMotionView>
    <SceneMotionView initialPose={{ y: 60, opacity: 0 }} pose={{ y: measured ? 0 : 60, opacity: measured ? 1 : 0 }} duration={650}>
      <MovingTitle><Text style={titleStyle}>So I measured it</Text></MovingTitle>
      <View style={{ width: 1200, height: 90, alignSelf: "center", marginTop: 60, borderTopWidth: 3, borderColor: cyan }}>
        {Array.from({ length: 25 }, (_, i) => <Arrive key={i} delay={i * 25} clock="step" fromY={-30}
          style={{ position: "absolute", left: i * 50, top: 0 }}><View style={{ width: 2, height: i % 5 === 0 ? 34 : 17, backgroundColor: cyan }} /></Arrive>)}
      </View>
    </SceneMotionView>
  </View>;
}

export function HelloWorldB() {
  const chart = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 850 }}>
    <SceneMotionView pose={{ y: chart ? 0 : 250 }} duration={750}><MovingTitle><Text style={{ ...titleStyle, fontSize: 72 }}>{chart ? "Hello World · first content" : "Hello World"}</Text></MovingTitle></SceneMotionView>
    <SceneMotionView pose={{ scaleX: chart ? 0.01 : 1, scaleY: chart ? 0.01 : 1, x: chart ? -550 : 0, y: chart ? -240 : 0, opacity: chart ? 0 : 1 }} duration={650}
      style={{ position: "absolute", left: 598, top: 390, width: 500, height: 240, borderWidth: 2, borderColor: cyan, borderRadius: 22, backgroundColor: "#101d2b", justifyContent: "center" }}>
      <Text style={{ ...titleStyle, fontSize: 42 }}>Hello World</Text>
    </SceneMotionView>
    {chart && <Arrive delay={350} clock="step" fromX={-90} fromY={0}><Chart metric="content" workload="hello" groupAtStep={2} /></Arrive>}
  </View>;
}

export function HelloBridgeB() {
  const populated = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 770, alignItems: "center", justifyContent: "center" }}>
    <MovingTitle><Text style={{ ...titleStyle, fontSize: 64, marginBottom: 38 }}>But hello world isn’t a real app</Text></MovingTitle>
    <SceneMotionView initialPose={{ scaleX: 0.4, scaleY: 0.4 }} pose={{ scaleX: populated ? 1 : 0.4, scaleY: populated ? 1 : 0.4 }} duration={1000}
      style={{ width: 1200, height: 650, borderRadius: 20, borderWidth: 2, borderColor: cyan, overflow: "hidden", backgroundColor: "#09131e" }}>
      <SceneMotionView pose={{ opacity: populated ? 1 : 0 }} duration={850}><Image source={{ uri: chatPoster }} resizeMode="contain" style={{ width: 1200, height: 650 }} /></SceneMotionView>
      <SceneMotionView pose={{ opacity: populated ? 0 : 1 }} duration={350} style={{ position: "absolute", inset: 0, justifyContent: "center" }}>
        <Text style={titleStyle}>Hello World</Text>
      </SceneMotionView>
    </SceneMotionView>
  </View>;
}

export function QuestionBlockersB() {
  const revealed = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 650, justifyContent: "center" }}>
    <SceneMotionView pose={{ y: revealed ? -220 : 0, scaleX: revealed ? 0.75 : 1, scaleY: revealed ? 0.75 : 1 }} duration={850}>
      <MovingTitle><Text style={titleStyle}>Why isn’t everyone doing this?</Text></MovingTitle>
    </SceneMotionView>
    {revealed && <View style={{ position: "absolute", top: 290, flexDirection: "row", gap: 56 }}>
      {["Performance", "Library support", "Desktop foundations"].map((label, i) => <SharedElement key={label} id={`objection-label-${i}`} resize="preserve">
        <Arrive delay={i * 180} clock="step" fromY={110}><View style={{ width: 528, height: 270, borderRadius: 36, borderWidth: 2, borderColor: cyan,
          backgroundColor: "#0b2536", justifyContent: "center", padding: 24 }}><Text style={{ ...titleStyle, fontSize: 42, lineHeight: 54 }}>{label}</Text></View></Arrive>
      </SharedElement>)}
    </View>}
  </View>;
}

export function HelpB() {
  const invite = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 620, justifyContent: "center", gap: 80 }}>
    <MovingTitle><Text style={titleStyle}>Please help</Text></MovingTitle>
    <DesktopBadges delay={250} />
    {invite && <Arrive clock="step"><View style={{ flexDirection: "row", justifyContent: "center", gap: 80 }}>
      {["Legend List", "Your library"].map(name => <View key={name} style={{ width: 450, height: 120, alignItems: "center", justifyContent: "center", borderTopWidth: 2, borderColor: cyan }}>
        <Text style={{ color: ink, fontSize: 44 }}>{name}</Text>
      </View>)}
    </View></Arrive>}
  </View>;
}

export function PresenterRevealB() {
  const reveal = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 880 }}>
    <SceneMotionView initialPose={{ opacity: 0 }} pose={{ opacity: reveal ? 1 : 0 }} delay={450} duration={650}
      style={{ position: "absolute", left: 0, top: 100, width: 1696, height: 700, borderRadius: 24, borderWidth: 2, borderColor: cyan, backgroundColor: "#0d1724", padding: 40 }}>
      <Text style={{ color: ink, fontSize: 36, fontWeight: "600" }}>Legend Slides</Text>
      <View style={{ position: "absolute", left: 1110, top: 170, width: 490, height: 260, borderRadius: 16, borderWidth: 1, borderColor: "#ffffff55", backgroundColor: "#101f30", justifyContent: "center" }}>
        <Text style={{ ...titleStyle, fontSize: 38 }}>Legend Slides</Text>
      </View>
    </SceneMotionView>
    <SceneMotionView pose={{ x: reveal ? -250 : 0, y: reveal ? -50 : 0, scaleX: reveal ? 0.55 : 1, scaleY: reveal ? 0.55 : 1 }} duration={1100}
      style={{ position: "absolute", left: 0, top: 230, width: 1696, height: 400, backgroundColor: "#000", justifyContent: "center", borderRadius: 20 }}>
      <MovingTitle><Text style={titleStyle}>One more thing...</Text></MovingTitle>
    </SceneMotionView>
  </View>;
}
