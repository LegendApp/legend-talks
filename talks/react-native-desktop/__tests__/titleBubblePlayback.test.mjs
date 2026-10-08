import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as simulation from "../titleBubbleSimulation";
import { createPlaybackState, transitionPlayback, advancePlayback } from "../../../../../packages/presentation/src/playbackState";

const { transformSync } = createRequire(new URL("../../../../../packages/presentation/package.json", import.meta.url))("esbuild");

function harness() {
  const clock = { value: createPlaybackState({ phase: "playing", slideKey: "title", stepKey: "absorb", stepIndex: 1 }) };
  const base = { value: { time: 20, brightness: 1, bestRect: [1200, 400, 260, 120] } };
  const visual = { get value() { return { ...base.value, stepIndex: clock.value.stepIndex, stepTime: clock.value.stepTime, time: clock.value.slideTime }; } };
  let tick;
  const modules = {
    "@legend-apps/presentation": { usePlayback: () => clock },
    "./titleBubbleSimulation": simulation,
    "react-native-reanimated": {
      useSharedValue: value => ({ value }),
      useDerivedValue: read => ({ get value() { return read(); } }),
      useAnimatedReaction: (read, react) => { tick = () => react(read()); },
    },
  };
  const module = { exports: {} };
  const code = transformSync(readFileSync(new URL("../useTitleBubbleSimulation.ts", import.meta.url), "utf8"), { loader: "ts", format: "cjs" }).code;
  Function("require", "module", "exports", code)(name => modules[name], module, module.exports);
  const output = module.exports.useTitleBubbleSimulation(base, [[1230, 420], [1300, 420], [1360, 420], [1430, 420]], visual);
  const frame = timestamp => { clock.value = advancePlayback(clock.value, timestamp); tick(); };
  tick();
  frame(0);
  for (let index = 1; index <= 600; index++) frame(index * 1000 / 60);
  return { clock, output, tick, frame, navigate(input) { clock.value = transitionPlayback(clock.value, { ...clock.value, ...input }); } };
}

test("release shader and bubble positions switch together when the UI reaction is queued", () => {
  const h = harness();
  const absorbed = h.output.value;
  expect(absorbed.absorbedScale).toBeGreaterThan(1);
  expect(absorbed.drops.some((value, index) => index % 4 === 2 && value > 0)).toBe(true);
  h.navigate({ stepKey: "release", stepIndex: 2 });
  expect(h.output.value).toEqual(absorbed);
  h.tick();
  const released = h.output.value;
  expect(released.stepIndex).toBe(2);
  expect(released.stepTime).toBe(0);
  expect(released.absorbedScale).toBe(absorbed.absorbedScale);
  expect(released.drops.filter((_, index) => index % 4 === 2).every(radius => radius === 0)).toBe(true);
  h.frame(10000 + 1000 / 60);
  h.frame(10100);
  expect(h.output.value.stepTime).toBeGreaterThan(0);
  expect(h.output.value.drops.some((value, index) => index % 4 === 2 && value > 0)).toBe(true);
});

test("back, outgoing freeze, and replay preserve a coherent simulation frame", () => {
  const h = harness();
  h.navigate({ stepKey: "release", stepIndex: 2 });
  h.tick();
  h.frame(10100);
  const released = h.output.value;
  h.navigate({ stepKey: "back", stepIndex: 1 });
  expect(h.output.value).toEqual(released);
  h.tick();
  expect(h.output.value.stepIndex).toBe(1);
  expect(h.output.value.absorbedScale).toBe(1);
  const reset = h.output.value;
  h.navigate({ phase: "outgoing", slideKey: "", stepKey: "", stepIndex: 0 });
  h.tick();
  expect(h.output.value).toEqual(reset);
  h.navigate({ phase: "playing", slideKey: "replay", stepKey: "initial", stepIndex: 0 });
  h.tick();
  expect(h.output.value.stepIndex).toBe(0);
  expect(h.output.value.stepTime).toBe(0);
  expect(h.output.value.absorbedScale).toBe(1);
});
