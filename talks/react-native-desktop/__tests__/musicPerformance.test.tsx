// @ts-nocheck Native drawing is mocked; slide navigation stays real.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SharedElement } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import { AnimatedTitle } from "../AnimatedTitle";
import { MovingTitle } from "../MovingTitle";

mock.module("../GlassPanels", () => ({ GlassPanels: () => null }));
const { MusicPerformance, MusicPerformanceTitle } = await import("../MusicPerformance");

test("CPU and memory keep the same frame and title prefix through forward and reverse navigation", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 1, stepEpochs: {} });
  const render = metric => <PresentationProvider value={runtime$}>
    <MusicPerformanceTitle metric={metric} />
    <MusicPerformance metric={metric} capture={`${metric}.png`} />
  </PresentationProvider>;
  let tree, frameStyle, prefixStyle, titleStyle, bodyStyle;
  try {
    for (const [index, metric] of ["cpu", "memory", "cpu"].entries()) {
      await act(() => {
        runtime$.slideIndex.set(index);
        if (tree) tree.update(render(metric));
        else tree = create(render(metric));
      });
      const frame = tree.root.findAllByType(SharedElement).find(node => node.props.id === "legend-music-capture");
      const prefix = tree.root.findByType(MovingTitle).findByType("text");
      const title = tree.root.findByType(MusicPerformanceTitle).findByType("view");
      const body = tree.root.findByType(MusicPerformance).findByType("view");
      const label = tree.root.findByType(AnimatedTitle);
      expect(prefix.props.children).toBe("Legend Music · ");
      expect(label.props.children).toBe(metric === "cpu" ? "CPU" : "memory");
      expect(label.props.effect).toBe("word-lift");
      expect(frame.findByType("image").props.resizeMode).toBe("contain");
      if (index === 0) {
        frameStyle = frame.props.style;
        prefixStyle = prefix.props.style;
        titleStyle = title.props.style;
        bodyStyle = body.props.style;
      } else {
        expect(frame.props.style).toEqual(frameStyle);
        expect(prefix.props.style).toEqual(prefixStyle);
        expect(title.props.style).toEqual(titleStyle);
        expect(body.props.style).toEqual(bodyStyle);
      }
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
