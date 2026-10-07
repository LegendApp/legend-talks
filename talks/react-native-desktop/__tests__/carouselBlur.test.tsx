// @ts-nocheck Native readbacks complete independently of React rendering.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React, { Profiler } from "react";
import { act, create } from "react-test-renderer";
const jobs = [];
let resolveCapture;
mock.module("@legend-apps/presentation", () => ({ snapshotCaptureQueue: {
  enqueue(run) { const job = { run, cancelled: false }; jobs.push(job); return () => { job.cancelled = true; }; },
} }));
mock.module("@shopify/react-native-skia", () => ({ Canvas: "canvas", Image: "sk-image", Blur: "blur", Group: "group", Paint: "paint",
  makeImageFromView: () => new Promise(resolve => { resolveCapture = resolve; }),
}));
const { CarouselBlurView } = await import("../CarouselBlurView");
test("layout and capture completion publish shared values without React commits, cancelling stale captures", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const progress = { value: { position: 0 } };
  let commits = 0, disposed = 0, tree;
  const content = enabled => <Profiler id="blur" onRender={() => commits++}><CarouselBlurView enabled={enabled} progress={progress} index={1}><content /></CarouselBlurView></Profiler>;
  const layout = width => tree.root.findAllByType("view")[0].props.onLayout({ nativeEvent: { layout: { width, height: 50 } } });
  try {
    await act(() => { tree = create(content(true)); });
    const initial = commits;
    await act(() => layout(100));
    expect(commits).toBe(initial);
    expect(jobs).toHaveLength(1);
    const first = jobs[0].run();
    const image = { dispose: () => disposed++ };
    await act(async () => { resolveCapture(image); await first; });
    expect(commits).toBe(initial);
    const snapshot = tree.root.findByType("sk-image");
    expect(snapshot.props.image.value).toBe(image);
    expect(snapshot.props.width.value).toBe(100);
    await act(() => layout(100));
    expect(jobs).toHaveLength(1);
    await act(() => layout(0));
    expect(disposed).toBe(1);
    await act(() => layout(200));
    expect(disposed).toBe(1);
    expect(commits).toBe(initial);
    const second = jobs[1].run();
    await act(() => tree.update(content(false)));
    await act(async () => { resolveCapture({ dispose: () => disposed++ }); await second; });
    expect(disposed).toBe(2);
    expect(tree.root.findAllByType("canvas")).toHaveLength(0);
  } finally { if (tree) await act(() => tree.unmount()); }
});

test("deferred canvas construction keeps live content until its capture surface commits", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  jobs.length = 0;
  const progress = { value: { position: 0 } };
  let tree;
  const content = enabled => <CarouselBlurView enabled={enabled} progress={progress} index={1}><content /></CarouselBlurView>;
  try {
    await act(() => { tree = create(content(false)); });
    const layout = width => tree.root.findAllByType("view")[0].props.onLayout({ nativeEvent: { layout: { width, height: 50 } } });
    await act(() => layout(100));
    await act(() => {
      tree.unstable_flushSync(() => tree.update(content(true)));
      expect(tree.root.findAllByType("canvas")).toHaveLength(0);
      layout(200);
      expect(jobs).toHaveLength(0);
    });
    expect(tree.root.findAllByType("canvas")).toHaveLength(1);
    expect(jobs).toHaveLength(1);
  } finally { if (tree) await act(() => tree.unmount()); }
});
