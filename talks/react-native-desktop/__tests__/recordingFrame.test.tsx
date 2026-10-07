// @ts-nocheck Resource state belongs to the provider, never the carousel consumer.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React, { useRef, useState } from "react";
import { act, create } from "react-test-renderer";
let publishReady;
const sources = [];
mock.module("@legend-apps/presentation", () => ({ useNativeVideo(source, playing) {
  const [, setReady] = useState(false); publishReady = setReady;
  sources.push([source, playing]);
  return { currentFrame: useRef({ value: null }).current };
} }));
const { RecordingFrameProvider, useRecordingFrame } = await import("../RecordingFrameProvider");
test("first selection loads one shared player and readiness leaves the carousel idle", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let renders = 0, tree;
  function Carousel() { renders++; const frame = useRecordingFrame(); return <card frame={frame}><takeover frame={frame} /></card>; }
  const children = <Carousel />;
  const render = (playing, isPreview = false) => <RecordingFrameProvider source="file:///gpui.mp4" playing={playing} isPreview={isPreview}>{children}</RecordingFrameProvider>;
  try {
    await act(() => { tree = create(render(false)); });
    expect(sources.at(-1)).toEqual([null, false]);
    expect(renders).toBe(1);
    await act(() => tree.update(render(true)));
    expect(sources.at(-1)).toEqual(["file:///gpui.mp4", true]);
    await act(() => publishReady(true));
    expect(renders).toBe(1);
    expect(tree.root.findByType("card").props.frame).toBe(tree.root.findByType("takeover").props.frame);
    await act(() => tree.update(render(false)));
    expect(sources.at(-1)).toEqual(["file:///gpui.mp4", false]);
    await act(() => tree.update(render(false, true)));
    expect(sources.at(-1)).toEqual([null, false]);
    expect(renders).toBe(1);
  } finally { if (tree) await act(() => tree.unmount()); }
});
