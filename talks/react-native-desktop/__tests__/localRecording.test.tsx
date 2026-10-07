// @ts-expect-error Bun runs this suite; its test types are outside the app's type environment.
import { mock, test, expect } from "bun:test";
import React, { useEffect } from "react";
import { act, create } from "react-test-renderer";

let mounts = 0;
let disposals = 0;
mock.module("@legend-apps/presentation", () => ({
  NativeVideoView: (props: any) => {
    useEffect(() => { mounts++; return () => { disposals++; }; }, []);
    return React.createElement("video", props);
  },
}));
const { LocalRecording } = await import("../LocalRecording");

test("recordings start on selection, stay mounted when paused, and resume without recreation", async () => {
  const previous = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  let renderer: ReturnType<typeof create> | undefined;
  const cards = (selected: number) => React.createElement(React.Fragment, null,
    Array.from({ length: 9 }, (_, index) => React.createElement(LocalRecording, {
      key: index, page: `file:///app-${index}.html`, poster: `file:///app-${index}.png`,
      playing: index === selected, extension: index === 2 ? "mov" : "mp4",
    })));
  try {
    await act(async () => { renderer = create(cards(-1)); });
    expect(mounts).toBe(0);
    expect(renderer!.root.findAllByType("image" as any)).toHaveLength(9);
    expect(renderer!.root.findAllByType("image" as any)[2].props.source.uri).toBe("file:///app-2.png");
    await act(async () => { renderer!.update(cards(0)); });
    expect(mounts).toBe(1);
    expect(renderer!.root.findAllByType("video" as any)[0].props).toMatchObject({ source: "file:///app-0.mp4", playing: true });
    await act(async () => { renderer!.update(cards(2)); });
    expect(mounts).toBe(2);
    expect(renderer!.root.findAllByType("video" as any).map(node => [node.props.source, node.props.playing]))
      .toEqual([["file:///app-0.mp4", false], ["file:///app-2.mov", true]]);
    await act(async () => { renderer!.update(cards(-1)); });
    expect(renderer!.root.findAllByType("video" as any).every(node => node.props.playing === false)).toBe(true);
    await act(async () => { renderer!.update(cards(0)); });
    expect(mounts).toBe(2);
    expect(disposals).toBe(0);
    expect(renderer!.root.findAllByType("image" as any)).toHaveLength(7);
    await act(async () => { renderer!.unmount(); });
    renderer = undefined;
    expect(disposals).toBe(2);
  } finally {
    if (renderer) await act(async () => { renderer!.unmount(); });
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = previous;
  }
});
