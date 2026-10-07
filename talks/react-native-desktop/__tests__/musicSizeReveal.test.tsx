// @ts-nocheck Native drawing is mocked; step subscriptions stay real.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";

mock.module("number-flow-react-native/skia", () => ({ SkiaNumberFlow: "number-flow" }));
mock.module("../GlassPanels", () => ({ GlassPanels: () => null }));
const { MusicSizeReveal } = await import("../MusicSizeReveal");

test("Music preserves both canvases while advancing and reversing the two measurements", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 2, stepEpochs: {} });
  let tree;
  try {
    await act(() => { tree = create(<PresentationProvider value={runtime$}><MusicSizeReveal /></PresentationProvider>); });
    const canvases = tree.root.findAllByType("canvas");
    expect(canvases).toHaveLength(2);
    for (const step of [0, 1, 0, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      const numbers = tree.root.findAllByType("number-flow");
      expect(numbers.map(number => number.props.value)).toEqual(step === 0 ? [35.3, 11.4] : [15.4, 6.3]);
      for (const number of numbers) {
        expect(number.props.format).toEqual({ minimumFractionDigits: 0, maximumFractionDigits: 0 });
        expect(number.props.spinTiming.animation).toBeTypeOf("function");
        expect(number.props.transformTiming).toBe(number.props.spinTiming);
        expect(number.props.opacityTiming).toBe(number.props.spinTiming);
      }
      tree.root.findAllByType("canvas").forEach((canvas, index) => expect(canvas).toBe(canvases[index]));
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
