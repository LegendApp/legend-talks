import { ImageShatter } from "slides:materials/ImageShatter";
import { PlaybackKeyframeView, ScenePositionView, usePresentationValue } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { SlidesHeader } from "./StoryDiagrams";
import { GitHubLink } from "./GitHubLink";
import { WebsiteIcon } from "./WebsiteIcon";
import type { TitleEntranceEffect } from "slides:typography/TitleEntrances";

// @ts-ignore Local deck screenshot resolves to a file URL.
import screenshotAsset from "./rnconnection-assets/legend-slides-screenshot.png";

const screenshotGeometry = { imageWidth: 1040, imageHeight: 710.638, centerX: 960, centerY: 600 };
const linkReveal = [{ time: 0, x: 0, y: 0, opacity: 0 }, { time: 650, x: 0, y: 0, opacity: 1 }];

export function SlidesReveal({ icon, children, authoring, titleEntrance, showLinks = true }: {
  icon: string; children: ReactNode; authoring: ReactNode; titleEntrance?: TitleEntranceEffect; showLinks?: boolean;
}) {
  const step = usePresentationValue("stepIndex");
  const screenshotStep = showLinks ? 2 : 1;
  return <View style={{ width: 1696, height: 880, alignSelf: "center" }}>
    {/* Report the step's destination to shared transitions as the header moves. */}
    <ScenePositionView style={{ width: 1696, zIndex: 2 }}
      y={step >= 1 ? 0 : (880 - 100) / 2} duration={650}>
      <SlidesHeader icon={icon} entrance={titleEntrance} />
    </ScenePositionView>
    <ImageShatter source={screenshotAsset} revealAtStep={screenshotStep} geometry={screenshotGeometry}
      accessibilityLabel="Legend Slides presenter window screenshot" width={1920} height={1180}
      style={{ position: "absolute", left: -112, top: -100 }} />
    {step >= screenshotStep + 2 && <View style={{ position: "absolute", top: 0, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} previewTime={4}>
        {authoring}
      </PlaybackKeyframeView>
    </View>}
    {step === screenshotStep + 1 && <View style={{ position: "absolute", top: 0, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} delay={1600} previewTime={4}>
        {children}
      </PlaybackKeyframeView>
    </View>}
    {showLinks && step === 1 && <View style={{ position: "absolute", top: 405, width: 1696 }}>
      <PlaybackKeyframeView keyframes={linkReveal} previewTime={4}>
        <GitHubLink repository="LegendApp/legend-apps" label="Legend Slides on GitHub" />
        <Pressable accessibilityRole="link" accessibilityLabel="https://legend.so" onPress={() => Linking.openURL("https://legend.so")}
          style={{ alignSelf: "center", padding: 16, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 22 }}>
          <WebsiteIcon size={48} />
          <Text style={{ color: "#68ddff", fontSize: 54, fontWeight: "600" }}>https://legend.so</Text>
        </Pressable>
      </PlaybackKeyframeView>
    </View>}
  </View>;
}
