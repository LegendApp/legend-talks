// @ts-nocheck All cards must consume one tween, including during interrupted navigation.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React, { useState } from "react";
import { act, create } from "react-test-renderer";

const progress = { value: { position: 0 } };
const targets = [];
mock.module("@legend-apps/presentation", () => ({
  ProgressivePreparation: ({ children }) => children,
  SceneMotionView: ({ children }) => children,
  NavigationExitView: ({ children }) => children,
  usePresentationValue: key => key === "playbackPhase" ? "preview" : key === "isPreview" ? true : 0,
  usePlaybackTween(target, duration) { targets.push({ target, duration }); return progress; },
}));
mock.module("../CarouselBlurView", () => ({ CarouselBlurView: ({ children }) => children }));
mock.module("../RNConnectionVisuals", () => ({ MediaSlot: "media" }));
mock.module("../MovingTitle", () => ({ MovingTitle: ({ children }) => children }));
mock.module("../LocalRecording", () => ({ LocalRecording: "recording" }));
const { AppCarousel } = await import("../AppCarousel");
const { FilmstripMotionView } = await import("../FilmstripMotionView");

test("nine cards share one clamped position tween and keep their state across steps", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  function Card({ id }) {
    const [count, setCount] = useState(0);
    return <card id={id} count={count} onPress={() => setCount(value => value + 1)} />;
  }
  const items = Array.from({ length: 9 }, (_, index) => String(index));
  const content = position => <AppCarousel items={items} position={position} renderCard={id => <Card id={id} />} />;
  let tree;
  try {
    await act(() => { tree = create(content(0)); });
    expect(targets).toEqual([{ target: { position: 0 }, duration: 500 }]);
    const cards = () => tree.root.findAllByType(FilmstripMotionView);
    expect(cards()).toHaveLength(9);
    expect(cards().every(card => card.props.progress === progress)).toBe(true);
    await act(() => tree.root.findAllByType("card")[0].props.onPress());
    for (const position of [4, 2, 100, -1]) {
      const previousCalls = targets.length;
      await act(() => tree.update(content(position)));
      expect(targets.length - previousCalls).toBe(1);
      expect(targets.at(-1).target.position).toBe(Math.max(0, Math.min(8, position)));
      expect(cards().every(card => card.props.progress === progress)).toBe(true);
      expect(tree.root.findAllByType("card")[0].props.count).toBe(1);
    }
  } finally { if (tree) await act(() => tree.unmount()); }
});
