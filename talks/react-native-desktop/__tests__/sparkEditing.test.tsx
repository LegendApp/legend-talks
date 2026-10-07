// @ts-nocheck Native drawing is mocked; compiled worklets and playback transitions stay real.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import React from "react";
import { act, create } from "react-test-renderer";
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileDeck } from "../../../../../packages/presentation/src/compiler";
import { samplePlayback } from "../../../../../packages/presentation/src/playback";
import { createPlaybackState, advancePlayback, transitionPlayback } from "../../../../../packages/presentation/src/playbackState";
import { sampleSparkEdit, sparkEditDuration, sparkEditPrompt } from "../sparkEditingTimeline";

test("prompt finishes typing before three seconds of generation, then the real result fades in", () => {
  expect(sampleSparkEdit(0).input).toBe(0);
  expect(sampleSparkEdit(1.5).text).toBe(sparkEditPrompt.slice(0, 10));
  const frames = Array.from({ length: 801 }, (_, index) => sampleSparkEdit(index / 100));
  const working = frames.filter(frame => frame.generating);
  expect(working).toHaveLength(300);
  expect(working.every(frame => frame.text === sparkEditPrompt && frame.result === 0)).toBe(true);
  expect(working.at(-1).spin).toBeGreaterThan(18);
  expect(frames.some(frame => frame.result > 0 && frame.result < 1)).toBe(true);
  expect(sampleSparkEdit(sparkEditDuration)).toMatchObject({ text: sparkEditPrompt, generating: false, result: 1, caret: 0 });
});

test("compiled screenshot overlays preserve images, serialize without fonts or module cycles, and freeze on exit", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const directory = mkdtempSync(join(tmpdir(), "spark-editing-worklets-"));
  let tree;
  try {
    for (const file of ["SparkAppEditingScreenshots.tsx", "sparkEditingTimeline.ts"]) {
      copyFileSync(join(import.meta.dir, "..", file), join(directory, file));
    }
    const deck = join(directory, "deck.mdx");
    writeFileSync(deck, 'export { SparkAppEditingScreenshots } from "./SparkAppEditingScreenshots"\n\n# Edit');
    const compiled = await compileDeck(deck);
    expect(compiled.success).toBe(true);
    let step = 0;
    let input = { phase: "playing", slideKey: "edit", stepKey: "initial", stepIndex: 0 };
    const clock = { value: createPlaybackState(input) };
    const callbacks = [];
    const font = { measureText: text => ({ width: text.length * 14 }) };
    font.self = font;
    const presentation = { SceneMotionView: "motion", usePlayback: () => clock, usePresentationValue: () => step, samplePlayback };
    const reanimated = { __esModule: true, default: { Image: "animated-image" },
      useDerivedValue: fn => { callbacks.push(fn); return { get value() { return restore(fn)(); } }; },
      useAnimatedStyle: fn => { callbacks.push(fn); return { get value() { return restore(fn)(); } }; },
    };
    presentation.self = presentation;
    reanimated.self = reanimated;
    function restore(fn) {
      if (!fn.__workletHash) return fn;
      const closure = Object.fromEntries(Object.entries(fn.__closure).map(([key, value]) => {
        if ([font, presentation, reanimated].includes(value)) throw new Error(`Unsafe ${key} capture: ${fn.__initData.code}`);
        return [key, typeof value === "function" ? restore(value) : value];
      }));
      return Function(`return (${fn.__initData.code});`)().bind({ __closure: closure });
    }
    const module = { exports: {} };
    Function("require", "module", "exports", compiled.code)(name => {
      if (name === "@legend-apps/presentation") return presentation;
      if (name === "react-native-reanimated") return reanimated;
      if (name === "react-native") return { View: "view", Image: "image" };
      if (name === "@shopify/react-native-skia") return { Canvas: "canvas", Circle: "circle", Group: "group", Path: "path",
        Rect: "rect", RoundedRect: "rounded-rect", Text: "skia-text", matchFont: () => font };
      return require(name);
    }, module, module.exports);
    const Demo = module.exports.SparkAppEditingScreenshots;
    const render = () => <Demo before="before.png" after="after.png" />;
    await act(() => { tree = create(render()); });
    const image = tree.root.findByType("animated-image");
    expect(image.props.style[1].value.opacity).toBe(0);
    step = 1;
    input = { ...input, stepIndex: 1, stepKey: "animate" };
    clock.value = transitionPlayback(clock.value, input);
    await act(() => tree.update(render()));
    clock.value = advancePlayback(clock.value, 0);
    clock.value = advancePlayback(clock.value, 5000);
    const labels = () => tree.root.findAllByType("skia-text").map(text => text.props.text.value);
    expect(labels()).toEqual([sparkEditPrompt, "Generating…"]);
    for (const phase of ["paused", "outgoing"]) {
      clock.value = transitionPlayback(clock.value, { ...input, phase });
      clock.value = advancePlayback(clock.value, 50000);
      expect(labels()).toEqual([sparkEditPrompt, "Generating…"]);
      expect(image.props.style[1].value.opacity).toBe(0);
    }
    clock.value = transitionPlayback(clock.value, { ...input, phase: "preview" });
    expect(image.props.style[1].value.opacity).toBe(1);
    expect(labels()).toEqual([sparkEditPrompt, "Generate & Preview"]);
    clock.value = transitionPlayback(clock.value, { ...input, phase: "preparing" });
    expect(image.props.style[1].value.opacity).toBe(0);
    expect(labels()[0]).toBe("");
    step = 0;
    input = { ...input, stepIndex: 0, stepKey: "back" };
    clock.value = transitionPlayback(clock.value, input);
    await act(() => tree.update(render()));
    expect(image.props.style[1].value.opacity).toBe(0);
    expect(labels()[0]).toBe("");
    step = 1;
    input = { ...input, stepIndex: 1, stepKey: "replay" };
    clock.value = transitionPlayback(clock.value, input);
    await act(() => tree.update(render()));
    clock.value = advancePlayback(clock.value, 65000);
    clock.value = advancePlayback(clock.value, 66500);
    expect(labels()[0]).toBe(sampleSparkEdit(1.5).text);
    expect(image.props.style[1].value.opacity).toBe(0);
    expect(tree.root.findByType("animated-image")).toBe(image);
    callbacks.forEach(fn => expect(fn.__workletHash).toBeDefined());
  } finally {
    if (tree) await act(() => tree.unmount());
    rmSync(directory, { recursive: true, force: true });
  }
});
