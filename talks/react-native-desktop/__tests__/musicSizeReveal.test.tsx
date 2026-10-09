// @ts-nocheck Native drawing is mocked; step subscriptions stay real.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";

mock.module("number-flow-react-native/skia", () => ({ SkiaNumberFlow: "number-flow" }));
mock.module("../ChartBar", () => ({ ChartBar: "chart-bar" }));
const { BenchmarkRow, chartLayout } = await import("../BenchmarkChart");
const { MusicSizeReveal } = await import("../MusicSizeReveal");

test("Music compares installed sizes on a fixed scale while advancing and reversing measurements", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 2, stepEpochs: {} });
  let tree;
  try {
    await act(() => { tree = create(<PresentationProvider value={runtime$}><MusicSizeReveal /></PresentationProvider>); });
    const canvases = tree.root.findAllByType("canvas");
    expect(canvases).toHaveLength(1);
    for (const step of [0, 1, 0, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      const numbers = tree.root.findAllByType("number-flow");
      const installed = step === 0 ? 35.3 : 15.4;
      expect(numbers.map(number => number.props.value)).toEqual([installed]);
      const rows = tree.root.findAllByType(BenchmarkRow);
      expect(rows.map(row => [row.props.name, row.props.value, row.props.maximum]))
        .toEqual([["Legend Music", installed, 430], ["Spotify", 430, 430]]);
      const musicBar = rows[0].findByType("chart-bar");
      expect(musicBar.parent.parent.props.width).toBeCloseTo(installed / 430 * chartLayout.barWidth);
      expect(musicBar.props.style.width).toBe("100%");
      expect(musicBar.props.animateEntrance).toBe(false);
      expect(musicBar.parent.props.style[1].value.transform).toBeUndefined();
      expect(rows[1].props.valueLabel).toBe("430.0 MB");
      expect(JSON.stringify(tree.toJSON())).not.toMatch(/zipped|zip size/i);
      for (const number of numbers) {
        expect(number.props.format).toEqual({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
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
