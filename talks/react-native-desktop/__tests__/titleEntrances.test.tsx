import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import React from "react";
import { act, create } from "react-test-renderer";
import { compileDeck } from "../../../../../packages/presentation/src/compiler";
import { createPlaybackState, advancePlayback, transitionPlayback } from "../../../../../packages/presentation/src/playbackState";
import { sampleTitleEntrance, titleEntranceEffects } from "../titleEntrancePresets";

test("every entrance begins hidden and settles without residual distortion", () => {
  const final = { x: 0, y: 0, opacity: 1, scaleX: 1, scaleY: 1, rotate: 0, rotateX: 0, reveal: 1, ghost: 0 };
  for (const effect of titleEntranceEffects) {
    for (const index of [0, 7, 16]) {
      assert.equal(sampleTitleEntrance(effect.id, 0, index, 17).opacity, 0, effect.id);
      assert.deepEqual(sampleTitleEntrance(effect.id, 4, index, 17), final, effect.id);
      for (let tick = 0; tick < 40; tick++) {
        const frame = sampleTitleEntrance(effect.id, tick / 20, index, 17);
        assert.ok(Object.values(frame).every(Number.isFinite), effect.id);
        assert.ok(frame.opacity >= 0 && frame.opacity <= 1, effect.id);
        assert.ok(frame.scaleX > 0 && frame.scaleY > 0, effect.id);
      }
    }
  }
});

test("compiled title worklets serialize and obey preparation, preview, steps, exit, and replay", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "title-entrance-worklets-"));
  const previousActEnvironment = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  try {
    for (const file of ["AnimatedTitle.tsx", "titleEntrancePresets.ts"]) {
      fs.copyFileSync(fileURLToPath(new URL(`../${file}`, import.meta.url)), path.join(directory, file));
    }
    const deck = path.join(directory, "deck.mdx");
    fs.writeFileSync(deck, 'export { AnimatedTitle } from "./AnimatedTitle"\n\n# Entrances');
    const compiled = await compileDeck(deck);
    if (!compiled.success) throw new Error(compiled.errors.join("\n"));
    const input = { phase: "playing" as const, slideKey: "sample", stepKey: "initial", stepIndex: 0 };
    const playback = { value: createPlaybackState(input) };
    const callbacks: any[] = [];
    const presentation: any = { usePlayback: () => playback,
      samplePlayback: (state: typeof playback.value, preview: number, clock: "slide" | "step") =>
        state.phase === "preparing" ? 0 : state.phase === "preview" ? preview : clock === "slide" ? state.slideTime : state.stepTime };
    const reanimated: any = { default: { View: "AnimatedView", Text: "AnimatedText" }, __esModule: true,
      useDerivedValue: (fn: any) => { callbacks.push(fn); return { get value() { return restore(fn)(); } }; },
      useAnimatedStyle: (fn: any) => { callbacks.push(fn); return fn(); } };
    presentation.self = presentation;
    reanimated.self = reanimated;
    const module = { exports: {} as any };
    Function("require", "module", "exports", compiled.code)((name: string) => {
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return require("react/jsx-runtime");
      if (name === "react-native") return { View: "View", Text: "Text" };
      if (name === "react-native-reanimated") return reanimated;
      if (name === "@legend-apps/presentation") return presentation;
      return {};
    }, module, module.exports);
    const { transformSync } = createRequire(new URL("../../../../../packages/presentation/package.json", import.meta.url))("esbuild");
    const steps = { exports: {} as any };
    const stepCode = transformSync(fs.readFileSync(fileURLToPath(new URL("../../../src/steps.tsx", import.meta.url)), "utf8"),
      { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
    Function("require", "module", "exports", stepCode)((name: string) => {
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return require("react/jsx-runtime");
      return {};
    }, steps, steps.exports);
    function restore(fn: any): any {
      if (!fn.__workletHash) return fn;
      const closure = Object.fromEntries(Object.entries(fn.__closure).map(([key, value]) => {
        assert.notEqual(value, presentation);
        assert.notEqual(value, reanimated);
        return [key, typeof value === "function" ? restore(value) : value];
      }));
      return Function(`return (${fn.__initData.code});`)().bind({ __closure: closure });
    }
    for (const effect of titleEntranceEffects) {
      callbacks.length = 0;
      let renderer: ReturnType<typeof create>;
      const title = React.createElement(module.exports.AnimatedTitle, { effect: effect.id }, "React Native\non the desktop");
      await act(async () => { renderer = create(steps.exports.resolveSteps(title).content); });
      assert.equal(renderer!.root.findByProps({ accessibilityRole: "header" }).props.accessibilityLabel, "React Native\non the desktop");
      const worklets = callbacks.map(fn => {
        assert.equal(typeof fn.__workletHash, "number");
        return restore(fn);
      });
      assert.ok(worklets.length > 0, effect.id);
      playback.value = createPlaybackState(input);
      const initial = worklets.map(fn => fn());
      playback.value = advancePlayback(advancePlayback(playback.value, 0), 550);
      const moving = worklets.map(fn => fn());
      assert.notDeepEqual(moving, initial, effect.id);
      playback.value = transitionPlayback(playback.value, { ...input, stepKey: "next-step", stepIndex: 1 });
      assert.deepEqual(worklets.map(fn => fn()), moving, `${effect.id}: slide entrance must not restart on a step`);
      for (const phase of ["paused", "outgoing"] as const) {
        playback.value = transitionPlayback(playback.value, { ...input, phase });
        playback.value = advancePlayback(playback.value, 10000);
        assert.deepEqual(worklets.map(fn => fn()), moving, `${effect.id}: ${phase} content freezes`);
      }
      playback.value = transitionPlayback(playback.value, { ...input, phase: "preview" });
      const preview = worklets.map(fn => fn());
      playback.value = advancePlayback(playback.value, 20000);
      assert.deepEqual(worklets.map(fn => fn()), preview, `${effect.id}: preview is static`);
      playback.value = transitionPlayback(playback.value, { ...input, phase: "preparing" });
      assert.deepEqual(worklets.map(fn => fn()), initial, effect.id);
      playback.value = transitionPlayback(playback.value, { ...input, slideKey: "return-visit" });
      assert.deepEqual(worklets.map(fn => fn()), initial, `${effect.id}: returning starts fresh`);
      await act(async () => renderer!.unmount());
    }
  } finally {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: previousActEnvironment });
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
