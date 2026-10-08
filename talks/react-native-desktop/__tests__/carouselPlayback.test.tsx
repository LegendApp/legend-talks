// @ts-nocheck One shared tween; UI settlement and React state are exercised explicitly.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React, { useState } from "react";
import { act, create } from "react-test-renderer";
import { createContext } from "react";
const progress = { value: { position: 0 } }, playback = { value: { phase: "preview", stepTime: 0 } };
const targets = [];
let reaction;
mock.module("react-native-reanimated", () => ({
  default: { View: "animated-view" }, makeMutable: value => ({ value }), runOnJS: fn => fn,
  useAnimatedStyle: read => ({ get value() { return read(); } }), useAnimatedReaction: (read, react) => { reaction = () => react(read()); },
}));
mock.module("@legend-apps/presentation", () => ({
  ProgressivePreparation: ({ children }) => children, SceneMotionView: ({ children }) => children,
  NavigationExitView: ({ children }) => children,
  usePlayback: () => playback,
  usePresentationValue: key => key === "playbackPhase" ? playback.value.phase : key === "isPreview" ? true : 0,
  usePlaybackTween(target, duration) { targets.push({ target, duration }); return progress; },
}));
mock.module("../CarouselBlurView", () => ({ CarouselBlurView: ({ children }) => children }));
mock.module("../RNConnectionVisuals", () => ({ MediaSlot: "media" }));
mock.module("../MovingTitle", () => ({ MovingTitle: ({ children }) => children }));
const RecordingPositionContext = createContext(undefined);
mock.module("../LocalRecording", () => ({ LocalRecording: "recording", RecordingPositionContext }));
const { AppCarousel } = await import("../AppCarousel");
const { FilmstripMotionView } = await import("../FilmstripMotionView");
const items = Array.from({ length: 9 }, (_, index) => String(index));
function Card({ id }) {
  const [count, setCount] = useState(0), position = React.useContext(RecordingPositionContext);
  return <card id={id} count={count} position={position} onPress={() => setCount(value => value + 1)} />;
}
const content = (position, mode = "filmstrip") => <AppCarousel items={items} position={position} mode={mode} renderCard={id => <Card id={id} />} />;

test("static previews mount only visible neighbors and preserve their keyed state and one shared tween", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  playback.value.phase = "preview"; targets.length = 0;
  let tree;
  try {
    await act(() => { tree = create(content(0)); });
    expect(targets).toEqual([{ target: { position: 0 }, duration: 500 }]);
    const cards = () => tree.root.findAllByType(FilmstripMotionView);
    expect(cards()).toHaveLength(2);
    await act(() => tree.root.findAllByType("card")[0].props.onPress());
    await act(() => tree.update(content(1)));
    expect(tree.root.findAllByType("card")[0].props.count).toBe(1);
    for (const position of [4, 2, 100, -1]) {
      const previousCalls = targets.length;
      await act(() => tree.update(content(position)));
      expect(targets.slice(previousCalls).every(call => call.target.position === Math.max(0, Math.min(8, position)))).toBe(true);
      expect(targets.at(-1).target.position).toBe(Math.max(0, Math.min(8, position)));
      expect(cards().length).toBeLessThanOrEqual(3);
      expect(cards().every(card => card.props.progress === progress)).toBe(true);
    }
  } finally { await act(() => tree?.unmount()); }
});

test("motion retains the traversed interval through interruptions, trims after settlement, and remembers video position", async () => {
  playback.value = { phase: "playing", stepTime: 0 }; progress.value.position = 0;
  let tree;
  try {
    await act(() => { tree = create(content(0)); });
    const firstPosition = tree.root.findAllByType("card")[0].props.position;
    firstPosition.value = 1234;
    await act(() => tree.update(content(5)));
    expect(tree.root.findAllByType("card").map(card => card.props.id)).toEqual(["0","1","2","3","4","5","6"]);
    await act(() => reaction());
    expect(tree.root.findAllByType("card")).toHaveLength(7);
    await act(() => tree.update(content(8)));
    expect(tree.root.findAllByType("card")).toHaveLength(9);
    playback.value.stepTime = 0.7; progress.value.position = 8;
    await act(() => reaction());
    expect(tree.root.findAllByType("card").map(card => card.props.id)).toEqual(["7","8"]);
    playback.value.stepTime = 0;
    await act(() => tree.update(content(0)));
    expect(tree.root.findAllByType("card")[0].props.position).toBe(firstPosition);
    expect(firstPosition.value).toBe(1234);
    playback.value.stepTime = 0.7; progress.value.position = 0;
    await act(() => reaction());
    expect(tree.root.findAllByType("card").map(card => card.props.id)).toEqual(["0","1"]);
    await act(() => tree.update(content(0, "grid")));
    expect(tree.root.findAllByType("card")).toHaveLength(9);
    playback.value.stepTime = 0;
    await act(() => tree.update(content(0)));
    expect(tree.root.findAllByType("card")).toHaveLength(9);
    playback.value.stepTime = 0.7;
    await act(() => reaction());
    expect(tree.root.findAllByType("card")).toHaveLength(2);
  } finally { await act(() => tree?.unmount()); }
});
