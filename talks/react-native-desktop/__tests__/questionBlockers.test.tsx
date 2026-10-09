// @ts-nocheck Native drawing is mocked; presentation subscriptions stay real.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SceneMotionView, ScenePositionView, FocusStage, FocusSurfaceContext,
  createFocusSurface, prepareFocusSurface, measureFocusSurface } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import { ObjectionCard } from "../DesktopObjections";
import { MovingTitle } from "../MovingTitle";
import { QuestionBlockers } from "../reactcon-scenes/StoryScenes";

test("title changes while rising with blockers, then strike and zoom advance without an extra step", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 4, stepEpochs: {} });
  let tree;
  try {
    await act(() => { tree = create(<PresentationProvider value={runtime$}><QuestionBlockers /></PresentationProvider>); });
    const canvases = tree.root.findAllByType("canvas");
    expect(canvases).toHaveLength(3);
    let revealedPoses;
    for (const step of [0, 1, 2, 3, 2, 1, 0, 3, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      const cards = tree.root.findAllByType(ObjectionCard);
      expect(cards.map(card => card.props.label)).toEqual(["Performance", "Library support", "Desktop foundations"]);
      expect(cards.every(card => card.props.revealed === (step >= 1))).toBe(true);
      expect(cards.map(card => card.props.crossed)).toEqual([step >= 2, false, false]);
      expect(cards.map(card => card.props.zoomTarget)).toEqual([step >= 3 ? 2 : null, step >= 3 ? 2 : null, step >= 3 ? 2 : null]);
      expect(cards[0].props.resolvedAt).toBe(2);
      expect(tree.root.findAllByType("shader").map(shader => shader.props.uniforms.value.broken)).toEqual([step >= 2 ? 1 : 0, 0, 0]);
      tree.root.findAllByType("canvas").forEach((canvas, index) => expect(canvas).toBe(canvases[index]));
      const poses = cards.map(card => card.findByType(SceneMotionView).props.pose);
      if (step === 1) revealedPoses = poses;
      if (step === 2) expect(poses).toEqual(revealedPoses);
      const title = tree.root.findByType(MovingTitle);
      const position = tree.root.findByType(ScenePositionView);
      expect(position.props.y).toBe(step >= 1 ? 20 : 380);
      if (step === 0) expect((1080 - 850) / 2 + position.props.y + title.props.style.height / 2).toBe(540);
      const headings = title.findAllByType(SceneMotionView);
      expect(headings).toHaveLength(2);
      expect(headings[0].props.hidden).toBe(step >= 1);
      expect(headings[0].props.pose.opacity).toBe(step >= 1 ? 0 : 1);
      expect(headings[1].props.hidden).toBe(step < 1);
      expect(headings[1].props.pose.opacity).toBe(step >= 1 ? 1 : 0);
      expect(headings[1].findByType("text").props.children).toBe("What’s holding desktop back");
      for (const heading of headings) expect(heading.findByType("text").props.style).toMatchObject({
        fontFamily: "Helvetica Neue", fontSize: 72, lineHeight: 90, fontWeight: "600", letterSpacing: -1.8,
      });
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});

test("shared title measurement includes its centered position and follows the raised heading", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 4, stepEpochs: {} });
  const surface = createFocusSurface();
  let tree;
  try {
    await act(() => {
      tree = create(<PresentationProvider value={runtime$}><FocusSurfaceContext.Provider value={{ surface }}>
        <FocusStage><QuestionBlockers /></FocusStage>
      </FocusSurfaceContext.Provider></PresentationProvider>, { createNodeMock: () => ({
        measureLayout: (_root, done) => done(112, (1080 - 850) / 2, 1696, 90),
      }) });
    });
    for (const step of [0, 1, 0, 3]) {
      await act(() => runtime$.stepIndex.set(step));
      await prepareFocusSurface(surface);
      const title = (await measureFocusSurface(surface)).elements.get("rnconnection-title");
      expect(title).toEqual({ x: 112, y: step === 0 ? 495 : 135, width: 1696, height: 90 });
      if (step === 0) expect(title.y + title.height / 2).toBe(540);
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
