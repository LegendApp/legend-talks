import { usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { ObjectionCard } from "./DesktopObjections";
import { ExistingModulesTitle } from "./ModuleCompatibility";

export function DesktopObjections({ returning = false, chapter, introduction = false }: {
  returning?: boolean;
  chapter?: "performance" | "foundations" | "modules";
  introduction?: boolean;
}) {
  const currentStep = usePresentationValue("stepIndex");
  const step = introduction ? Math.max(0, currentStep - 2) : currentStep;
  const modules = chapter === "modules" || (!chapter && returning);
  const zoomTarget = chapter ? step >= 1 ? { performance: 0, foundations: 2, modules: 1 }[chapter] : null
    : step >= 2 ? returning ? 1 : 2 : null;
  const crossed = chapter ? [chapter !== "performance", false, chapter === "modules"]
    : [returning || step >= 1, false, returning && step >= 1];
  return <View style={{ width: 1696, height: 660, marginTop: 45, alignSelf: "center" }}>
    {(chapter ? ["Performance concerns", "Library support", "Desktop foundations"] : ["Performance", "Library support", "Desktop foundations"]).map((label, index) =>
      <ObjectionCard key={label} label={label} index={index} crossed={crossed[index]!}
        settled={chapter ? crossed[index]! : returning && index === 0} zoomTarget={zoomTarget} separateLabel={modules && index === 1}
        revealed={!introduction || currentStep >= 1} delay={introduction && currentStep <= 1 ? index * 180 : 0}
        resolvedAt={introduction ? 3 : 1} />)}
    {modules && <ExistingModulesTitle title="Library support" inCard expanded={step >= (chapter ? 1 : 2)} />}
  </View>;
}
