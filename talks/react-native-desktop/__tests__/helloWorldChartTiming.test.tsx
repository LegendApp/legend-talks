// @ts-nocheck Native drawing is mocked; the playback clock and tween run unchanged.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import React from "react";
import { act, create } from "react-test-renderer";
import { frames, flushUI } from "../../../test-support/legend-apps/apps/slides/src/__tests__/uiClockMock";
import { PresentationProvider, SceneMotionView } from "@legend-apps/presentation";

mock.module("../BenchmarkTitle", () => ({ BenchmarkTitle: () => null }));
mock.module("../BenchmarkChart", () => ({ Chart: () => <chart /> }));
const { HelloWorldIntro } = await import("../HelloWorldIntro");

test("the chart waits half a second after reveal and continues through later steps", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ playbackPhase: "playing", slideIndex: 0, stepIndex: 0 });
  let tree;
  try {
    await act(() => { tree = create(<PresentationProvider value={runtime$}><HelloWorldIntro /></PresentationProvider>); });
    flushUI();
    const frame = frames.at(-1);
    const chart = tree.root.findByType("chart");
    const fade = tree.root.findAllByType(SceneMotionView)[1];
    const opacity = () => fade.findByType("animated-view").props.style[1].value.opacity;
    frame.tick(1000);
    frame.tick(10000);
    expect(opacity()).toBe(0);
    expect(fade.props.hidden).toBe(true);
    await act(() => runtime$.stepIndex.set(1));
    flushUI();
    frame.tick(10100);
    frame.tick(10599);
    expect(opacity()).toBe(0);
    frame.tick(10600);
    expect(opacity()).toBe(0);
    frame.tick(10925);
    expect(opacity()).toBeCloseTo(0.5);
    await act(() => runtime$.stepIndex.set(2));
    flushUI();
    expect(opacity()).toBeCloseTo(0.5);
    frame.tick(11250);
    expect(opacity()).toBe(1);
    expect(tree.root.findByType("chart")).toBe(chart);
    await act(() => runtime$.stepIndex.set(0));
    flushUI();
    frame.tick(11350);
    frame.tick(12000);
    expect(opacity()).toBe(0);
    await act(() => runtime$.stepIndex.set(1));
    flushUI();
    frame.tick(12100);
    frame.tick(12599);
    expect(opacity()).toBe(0);
    await act(() => runtime$.playbackPhase.set("preview"));
    flushUI();
    expect(opacity()).toBe(1);
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
