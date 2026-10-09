// @ts-nocheck Native drawing is mocked; slide navigation stays real.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SceneMotionView, SharedElement } from "@legend-apps/presentation";
import { readFileSync } from "node:fs";
import React from "react";
import { act, create } from "react-test-renderer";
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
      const label = title.findByType(SceneMotionView);
      expect(prefix.props.children).toBe("Legend Music ·");
      expect(label.findByType("text").props.children).toBe(metric === "cpu" ? "CPU" : "memory");
      expect(label.findByType("text").props.style[1].textAlign).toBe("left");
      expect(label.props.initialPose).toEqual({ y: 90, opacity: 0 });
      expect(label.props.pose).toEqual({ y: 0, opacity: 1 });
      expect(label.parent.props.style).toMatchObject({ marginLeft: 16, overflow: "hidden" });
      expect(frame.findByType("image").props.resizeMode).toBe("contain");
      const png = readFileSync(new URL(`../rnconnection-assets/rnl-2025/music${metric === "cpu" ? "cpu" : "memory"}.png`, import.meta.url));
      const sourceWidth = png.readUInt32BE(16), sourceHeight = png.readUInt32BE(20);
      expect(frame.findByType("image").props.style.aspectRatio).toBeCloseTo(sourceWidth / sourceHeight);
      expect(frame.findByType("image").props.style.borderRadius).toBe(24);
      const scale = Math.min(frame.props.style.width / sourceWidth, frame.props.style.height / sourceHeight);
      expect(sourceWidth * scale).toBeCloseTo(566);
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
