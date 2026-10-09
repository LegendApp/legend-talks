// @ts-nocheck One shared tween; UI settlement and React state are exercised explicitly.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React, { useState } from "react";
import { act, create } from "react-test-renderer";
import { createContext } from "react";
const progress = { value: { position: 0 } }, playback = { value: { phase: "preview", stepTime: 0 } };
const targets = [];
let reaction;
let stepIndex = 0, isPreview = true;
mock.module("react-native-reanimated", () => ({
  default: { View: "animated-view" }, makeMutable: value => ({ value }), runOnJS: fn => fn,
  useAnimatedStyle: read => ({ get value() { return read(); } }), useAnimatedReaction: (read, react) => { reaction = () => react(read()); },
}));
mock.module("@legend-apps/presentation", () => ({
  SnapshotCaptureBoundary: ({ children, suspended }) => <capture-boundary suspended={suspended}>{children}</capture-boundary>,
  ProgressivePreparation: ({ children }) => children, SceneMotionView: ({ children }) => children,
  NavigationExitView: ({ children, enabled }) => <exit-view enabled={enabled}>{children}</exit-view>,
  usePlayback: () => playback,
  usePresentationValue: key => key === "playbackPhase" ? playback.value.phase : key === "isPreview" ? isPreview : stepIndex,
  usePlaybackTween(target, duration) { targets.push({ target, duration }); return progress; },
}));
mock.module("../CarouselBlurView", () => ({ CarouselBlurView: ({ children }) => children }));
mock.module("../RNConnectionVisuals", () => ({ MediaSlot: "media" }));
mock.module("../MovingTitle", () => ({ MovingTitle: ({ children }) => children }));
const RecordingPositionContext = createContext(undefined);
mock.module("../LocalRecording", () => ({ LocalRecording: props => {
  const position = React.useContext(RecordingPositionContext);
  return <recording {...props} position={props.position ?? position} />;
}, RecordingPositionContext }));
const { AppCarousel, AppShowcase } = await import("../AppCarousel");
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
    expect(tree.root.findByType("capture-boundary").props.suspended).toBe(true);
    await act(() => reaction());
    expect(tree.root.findAllByType("card")).toHaveLength(7);
    await act(() => tree.update(content(8)));
    expect(tree.root.findAllByType("card")).toHaveLength(9);
    playback.value.stepTime = 0.7; progress.value.position = 8;
    await act(() => reaction());
    expect(tree.root.findAllByType("card").map(card => card.props.id)).toEqual(["7","8"]);
    expect(tree.root.findByType("capture-boundary").props.suspended).toBe(false);
    playback.value.stepTime = 0;
    await act(() => tree.update(content(0)));
    playback.value.phase = "outgoing";
    await act(() => tree.update(content(0)));
    expect(tree.root.findByType("capture-boundary").props.suspended).toBe(false);
    playback.value.phase = "playing";
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

test("slide fades can disable the shrinking card exit without changing carousel placement", async () => {
  playback.value = { phase: "playing", stepTime: 0 }; progress.value.position = 2;
  const render = animateExit => <AppCarousel items={items} position={2} animateExit={animateExit} renderCard={id => <Card id={id} />} />;
  let tree;
  try {
    await act(() => { tree = create(render(false)); });
    const selected = () => tree.root.findAllByType(FilmstripMotionView).find(card => card.props.index === 2);
    const placement = selected().findAllByType("animated-view")[0].props.style[1].value;
    playback.value.phase = "outgoing";
    await act(() => tree.update(render(false)));
    expect(tree.root.findAllByType("exit-view").every(node => node.props.enabled === false)).toBe(true);
    expect(selected().findAllByType("animated-view")[0].props.style[1].value).toEqual(placement);
    await act(() => tree.update(render(undefined)));
    expect(tree.root.findAllByType("exit-view").every(node => node.props.enabled === true)).toBe(true);
  } finally { await act(() => tree?.unmount()); }
});

test("Diff launch follows its normal video on the same card and keeps separate playback positions in both directions", async () => {
  const apps = ["Legend Photos", "Legend Music", "Code", "Diff", "Chat History", "Markdown"];
  const content = (launchDemo = true) => <AppShowcase apps={apps} title="My apps" launchDemo={launchDemo} />;
  playback.value = { phase: "playing", stepTime: 0 };
  stepIndex = 3; isPreview = false;
  let tree;
  try {
    await act(() => { tree = create(content()); });
    const selected = () => tree.root.findByType(AppCarousel).props.position;
    const playing = () => tree.root.findAllByType("recording").filter(node => node.props.playing);
    expect(selected()).toBe(3);
    expect(playing()).toHaveLength(1);
    const normal = playing()[0].props;
    normal.position.value = 9000;
    const chatPage = tree.root.findAllByType("recording").at(-1).props.page;

    stepIndex = 4;
    await act(() => tree.update(content()));
    expect(selected()).toBe(3);
    expect(playing()).toHaveLength(1);
    const launch = playing()[0].props;
    expect(launch.page).not.toBe(normal.page);
    expect(launch.position).not.toBe(normal.position);
    expect(launch.position.value).toBe(0);
    launch.position.value = 2500;

    stepIndex = 5;
    await act(() => tree.update(content()));
    expect(selected()).toBe(4);
    expect(playing()).toHaveLength(1);
    expect(playing()[0].props.page).toBe(chatPage);
    stepIndex = 6;
    await act(() => tree.update(content()));
    expect(selected()).toBe(5);
    expect(playing()).toHaveLength(0);

    stepIndex = 4;
    await act(() => tree.update(content()));
    expect(playing()[0].props.position).toBe(launch.position);
    expect(playing()[0].props.position.value).toBe(2500);
    stepIndex = 3;
    await act(() => tree.update(content()));
    expect(playing()[0].props.page).toBe(normal.page);
    expect(playing()[0].props.position).toBe(normal.position);
    expect(playing()[0].props.position.value).toBe(9000);

    await act(() => tree.update(content(false)));
    expect(selected()).toBe(3);
    expect(playing()[0].props.page).toBe(normal.page);
    stepIndex = 4;
    await act(() => tree.update(content(false)));
    expect(selected()).toBe(4);
    expect(playing()[0].props.page).toBe(chatPage);
    stepIndex = 0;
    await act(() => tree.update(<AppShowcase apps={["Diff"]} title="Diff" />));
    expect(playing()[0].props.page).toBe(normal.page);

    playback.value.phase = "preparing";
    await act(() => tree.update(content()));
    expect(playing()).toHaveLength(0);
    isPreview = true;
    await act(() => tree.update(content()));
    expect(tree.root.findAllByType("recording")).toHaveLength(0);
  } finally {
    await act(() => tree?.unmount());
    stepIndex = 0; isPreview = true;
  }
});
