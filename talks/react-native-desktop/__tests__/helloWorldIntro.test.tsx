// @ts-nocheck Native drawing is mocked; slide navigation stays real.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SceneMotionView } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import { AnimatedTitle } from "../AnimatedTitle";
import { MovingTitle } from "../MovingTitle";
import { HelloWorldTitle } from "../HelloWorldTitle";

mock.module("../BenchmarkChart", () => ({ Chart: () => null }));
const { HelloWorldIntro } = await import("../HelloWorldIntro");

test("Hello World keeps its layout and entrance mounted while moving into the chart header", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 3, stepEpochs: {} });
  let tree;
  try {
    await act(() => { tree = create(<PresentationProvider value={runtime$}><HelloWorldIntro /></PresentationProvider>); });
    const measurement = tree.root.findAllByType("text").find(node => node.props.onLayout);
    await act(() => measurement.props.onLayout({ nativeEvent: { layout: { width: 400 } } }));
    const prefix = tree.root.findByType(MovingTitle);
    const entrance = tree.root.findByType(AnimatedTitle);
    const row = tree.root.findByType(HelloWorldTitle).findAllByType(SceneMotionView)[0];
    const caption = tree.root.findByType(HelloWorldTitle).findAllByType(SceneMotionView)[1];
    const captionFrame = caption.parent;
    const titleFrame = tree.root.findByType(HelloWorldTitle).findByType("view");
    const frameStyle = titleFrame.props.style;
    const captionStyle = captionFrame.props.style;
    const { width: metricWidth, marginLeft: gap } = captionStyle;
    expect((1696 - (400 + gap + metricWidth)) / 2 + 400 / 2 + row.props.pose.x).toBe(1696 / 2);
    expect(entrance.props.effect).toBe("stretch-release");
    expect(entrance.props.width).toBe(400);

    for (const step of [1, 2, 0, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      const motions = tree.root.findAllByType(SceneMotionView);
      const showChart = step > 0;
      expect(tree.root.findByType(MovingTitle)).toBe(prefix);
      expect(tree.root.findByType(AnimatedTitle)).toBe(entrance);
      expect(entrance.props.children).toBe("Hello World");
      expect(titleFrame.props.style).toEqual(frameStyle);
      expect(caption.parent).toBe(captionFrame);
      expect(captionFrame.props.style).toEqual(captionStyle);
      expect(motions[0].props.pose).toEqual({ y: showChart ? 0 : 320 });
      expect(row.props.pose).toEqual({ x: showChart ? 0 : (metricWidth + gap) / 2 });
      expect(row.props.duration).toBe(motions[0].props.duration);
      expect(row.props.duration).toBe(650);
      expect(caption.props.pose).toEqual({ y: showChart ? 0 : 90, opacity: showChart ? 1 : 0 });
      expect(caption.findByType("text").props.children).toBe(showChart ? "· first content" : "");
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
