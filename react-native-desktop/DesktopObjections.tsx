import { SceneMotionView, SharedElement, usePresentationValue } from "@legend-apps/presentation";
import { ExistingModulesTitle } from "./ModuleCompatibility";
import { GlassStrike } from "slides:materials/GlassStrike";
import { Text, View } from "react-native";

/** Both resolved objections use the exact same glass, strike, sparks and check. */
export function ObjectionCard({ label, index, crossed, settled, zoomTarget, separateLabel, revealed = true, delay = 0, resolvedAt = 1 }: {
  label: string; index: number; crossed: boolean; settled: boolean; zoomTarget: number | null; separateLabel: boolean;
  revealed?: boolean; delay?: number; resolvedAt?: number;
}) {
  const zoom = zoomTarget !== null;
  const center = index === zoomTarget;
  return <SceneMotionView duration={850} delay={delay} hidden={!revealed}
    pose={{ x: zoom ? center ? (1 - index) * 564 : (index < zoomTarget! ? -450 : 450) : 0,
      y: !revealed ? 110 : zoom && center ? 35 : 0,
      scaleX: zoom && center ? 1.65 : 1, scaleY: zoom && center ? 1.65 : 1,
      opacity: !revealed || zoom && !center ? 0 : 1 }}
    style={{ position: "absolute", left: 30 + index * 564, top: 105, width: 508, height: 384 }}>
    <GlassStrike crossed={crossed} settled={settled} centerX={396 + index * 564} phase={index * 1.7}
      trigger={resolvedAt} active={revealed} width={1920} height={1080}
      style={{ position: "absolute", left: -142 - index * 564, top: -108 }} />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      {!separateLabel && <SharedElement id={index === 1 ? "existing-modules-title" : `objection-label-${index}`} resize="preserve">
        <Text style={{ color: "#ffffff", fontSize: 42, fontWeight: "600", textAlign: "center", lineHeight: 54,
          textShadowColor: "#07121f", textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } }}>{label}</Text>
      </SharedElement>}
    </View>
  </SceneMotionView>;
}

export function DesktopObjections({ returning = false }: { returning?: boolean }) {
  const step = usePresentationValue("stepIndex");
  const zoomTarget = step >= 2 ? returning ? 1 : 2 : null;
  const crossed = [returning || step >= 1, false, returning && step >= 1];
  return <View style={{ width: 1696, height: 660, marginTop: 45, alignSelf: "center" }}>
    {["Performance", "Existing Modules", "Desktop foundations"].map((label, index) =>
      <ObjectionCard key={label} label={label} index={index} crossed={crossed[index]!}
        settled={returning && index === 0} zoomTarget={zoomTarget} separateLabel={returning && index === 1} />)}
    {returning && <ExistingModulesTitle inCard expanded={step >= 2} />}
  </View>;
}
