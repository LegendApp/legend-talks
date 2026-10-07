// @ts-nocheck Native drawing is mocked; presentation subscriptions stay real.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SceneMotionView } from "@legend-apps/presentation";
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
      const headings = tree.root.findByType(MovingTitle).findAllByType(SceneMotionView);
      expect(headings).toHaveLength(3);
      expect(headings[0].props.pose.y).toBe(step >= 1 ? 0 : 280);
      expect(headings[1].props.hidden).toBe(step >= 1);
      expect(headings[1].props.pose.opacity).toBe(step >= 1 ? 0 : 1);
      expect(headings[2].props.hidden).toBe(step < 1);
      expect(headings[2].props.pose.opacity).toBe(step >= 1 ? 1 : 0);
      expect(headings[2].findByType("text").props.children).toBe("What’s holding desktop back");
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
