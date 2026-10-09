import { TrajectoryEmitter } from "slides:particles/TrajectoryEmitter";
import { SceneMotionView, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";
import { MovingTitle } from "./MovingTitle";

import { BranchFan } from "slides:diagrams/BranchFan";

const implementations = ["iOS", "Android", "Mac", "Windows", "Web"];
const branchX = (index: number) => 168 + index * 340;
const ease = (t: number) => t * t * (3 - 2 * t);

const branches = { root: { x: 848, y: 70 }, ends: implementations.map((_, index) => ({ x: branchX(index), y: 570 })) };
const emissionInterval = 300;
const travelDuration = 1900;
const warmupStarts = [750, 1650, 2425, 3075, 3625, 4075, 4425];
const steadyStart = 4725;
// Precompute varied routes once. A single native clock keeps emissions evenly
// spaced; no timers, frame callbacks or per-cycle JS lane selection.
const routes = Array.from({ length: 3 }, () => {
  const lanes = implementations.map((_, index) => index);
  for (let index = lanes.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [lanes[index], lanes[other]] = [lanes[other], lanes[index]];
  }
  return lanes;
}).flat();
const trajectories = routes.map((lane) => Array.from({ length: 41 }, (_, sample) => {
  const t = sample / 40;
  return { time: t * travelDuration, x: 848 + (branchX(lane) - 848) * ease(t),
    y: 70 + t * 500, opacity: Math.min(1, t / 0.08, (1 - t) / 0.10) };
}));

const initialEmissions = warmupStarts.map((delay, trajectory) => ({ delay, trajectory }));
function CryingStream() {
  return <TrajectoryEmitter trajectories={trajectories} interval={emissionInterval} start={steadyStart} initialEmissions={initialEmissions}
    previewTime={12} style={{ position: "absolute", left: -30, top: -35 }} renderParticle={() => <Text style={{ fontSize: 58, lineHeight: 72 }}>😭</Text>} />;
}

export function AIMaintenance() {
  const maintenance = usePresentationValue("stepIndex") > 0;
  return <View style={{ width: 1696, height: 850, alignSelf: "center" }}>
    <MovingTitle><Text style={{ color: "#ffffff", fontSize: 72, lineHeight: 88, fontWeight: "600", textAlign: "center" }}>{maintenance ? "You maintain it five times" : "AI can write it five times"}</Text></MovingTitle>
    <View style={{ position: "absolute", left: 0, top: 120, width: 1696, height: 650 }}>
      <BranchFan geometry={branches} width={1696} height={650} emphasized={maintenance} style={{ position: "absolute", inset: 0 }} />
      <Text style={{ position: "absolute", top: 0, left: 600, width: 496, textAlign: "center", color: maintenance ? "#fda4af" : "#8de4ff", fontSize: 40, lineHeight: 52 }}>{maintenance ? "One bug fix" : "One feature"}</Text>
      {maintenance && <CryingStream />}
      {implementations.map((name, index) => <View key={name} style={{ position: "absolute", left: branchX(index) - 125, top: 600, width: 250, alignItems: "center" }}>
        <Text style={{ color: "#f1f5f9", fontSize: 40, lineHeight: 52, textAlign: "center", fontWeight: "600" }}>{name}</Text>
        <SceneMotionView hidden={!maintenance} pose={{ opacity: maintenance ? 1 : 0 }} duration={450} style={{ marginTop: 12 }}>
          <Text style={{ color: "#fda4af", fontSize: 24 }}>Fix + verify</Text>
        </SceneMotionView>
      </View>)}
    </View>
  </View>;
}
