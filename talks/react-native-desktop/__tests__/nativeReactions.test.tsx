// @ts-nocheck Native drawing is mocked; navigation and keyframe sampling stay real.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import * as presentation from "@legend-apps/presentation";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { act, create } from "react-test-renderer";
import * as reanimated from "react-native-reanimated";
import { samplePlayback } from "../../../test-support/legend-apps/packages/presentation/src/playback";
import { MovingTitle } from "../MovingTitle";

const { transformSync } = createRequire(new URL("../../../test-support/legend-apps/packages/presentation/package.json", import.meta.url))("esbuild");

function load(filename, mocks) {
  const require = createRequire(filename);
  const module = { exports: {} };
  const code = transformSync(readFileSync(filename, "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
  Function("require", "module", "exports", code)(name => mocks[name] ?? (name.endsWith(".png") ? name : require(name)), module, module.exports);
  return module.exports;
}

test("reaction letters remain visible through stagger delays and fade before arrival, including replay", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const clock = { value: { phase: "playing", stepTime: 0 } };
  const { PlaybackKeyframeView } = load(`${import.meta.dir}/../../../test-support/legend-apps/packages/presentation/src/PlaybackKeyframeView.tsx`, {
    "./playback": { usePlayback: () => clock, samplePlayback },
    "react-native-reanimated": { ...reanimated, __esModule: true },
  });
  const { NativeReactions } = load(`${import.meta.dir}/../reactcon-scenes/NativeReactions.tsx`, {
    "@legend-apps/presentation": { ...presentation, PlaybackKeyframeView },
    "../MovingTitle": { MovingTitle },
  });
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 2, stepEpochs: {} });
  let tree;
  try {
    await act(() => { tree = create(<presentation.PresentationProvider value={runtime$}><NativeReactions /></presentation.PresentationProvider>); });
    const measurements = tree.root.findAllByType("text").filter(node => node.props.onTextLayout);
    await act(() => measurements.forEach((node, index) => node.props.onTextLayout({ nativeEvent: {
      lines: [{ width: index % 2 === 0 ? 40 : (Math.floor(index / 2) + 1) * 40 }],
    } })));
    const stage = tree.root.findByType(NativeReactions).findByType("view");
    const cards = stage.children.filter(node => node.type === presentation.SceneMotionView);
    expect(cards).toHaveLength(6);
    expect(stage.children.indexOf(stage.findByType(MovingTitle))).toBeLessThan(stage.children.indexOf(cards[0]));
    for (const step of [0, 1, 0, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      const title = tree.root.findByType(MovingTitle);
      expect(title.findAllByType("text")[0].props.style[1].opacity).toBe(step === 0 ? 1 : 0);
      expect(tree.root.findAllByType("image")).toHaveLength(step === 0 ? 0 : 6);
      const letters = title.findAllByType(presentation.SceneMotionView);
      expect(letters.length).toBeGreaterThan(20);
      for (const letter of letters) {
        const fades = letter.findAllByType(PlaybackKeyframeView);
        expect(fades).toHaveLength(step === 0 ? 0 : 1);
        if (step === 0) continue;
        const fade = fades[0];
        clock.value.stepTime = 0;
        expect(fade.findByType("animated-view").props.style[1].value.opacity).toBe(1);
        clock.value.stepTime = letter.props.delay / 1000;
        expect(fade.findByType("animated-view").props.style[1].value.opacity).toBe(1);
        const opacity = time => {
          clock.value.stepTime = (letter.props.delay + time) / 1000;
          return fade.findByType("animated-view").props.style[1].value.opacity;
        };
        expect(opacity(200)).toBe(1);
        expect(opacity(500)).toBeGreaterThan(0);
        expect(opacity(500)).toBeLessThan(1);
        expect(opacity(letter.props.duration - 100)).toBe(0);
        expect(opacity(letter.props.duration + 500)).toBe(0);
      }
      clock.value.stepTime = 0;
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
