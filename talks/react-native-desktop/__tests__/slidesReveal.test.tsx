// @ts-nocheck Native drawing is mocked; presentation subscriptions stay real.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, ScenePositionView } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as skia from "@shopify/react-native-skia";
import { AnimatedTitle } from "../AnimatedTitle";
import { MovingTitle } from "../MovingTitle";
import { GlassPanels } from "../GlassPanels";

const { transformSync } = createRequire(new URL("../../../../../packages/presentation/package.json", import.meta.url))("esbuild");
function load(filename, mocks) {
  const require = createRequire(filename);
  const module = { exports: {} };
  const code = transformSync(readFileSync(filename, "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
  Function("require", "module", "exports", code)(name => mocks[name] ?? (name.endsWith(".png") ? name : require(name)), module, module.exports);
  return module.exports;
}
const drawing = { ...skia, Path: "path", ImageShader: "image-shader", useImage: () => ({}) };
const links = { GitHubLink: "github-link" };
const { SlidesHeader } = load(`${import.meta.dir}/../StoryDiagrams.tsx`, {
  "./GitHubLink": links, "./RendererWindows": {}, "./ExpoDesktopScene": {}, "./ModuleCompatibility": {},
});
const { WebsiteIcon } = load(`${import.meta.dir}/../WebsiteIcon.tsx`, { "@shopify/react-native-skia": drawing });
const { SlidesReveal } = load(`${import.meta.dir}/../SlidesReveal.tsx`, {
  "@shopify/react-native-skia": drawing, "./StoryDiagrams": { SlidesHeader }, "./GitHubLink": links, "./WebsiteIcon": { WebsiteIcon },
});

for (const showLinks of [true, false]) test(`Slides reveals stay aligned with the screenshot shader with links ${showLinks ? "included" : "removed"}`, async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: showLinks ? 5 : 4, stepEpochs: {} });
  const render = entrance => <PresentationProvider value={runtime$}><SlidesReveal icon="slides.png"
    titleEntrance={entrance} showLinks={showLinks} authoring={<authoring />}><features /></SlidesReveal></PresentationProvider>;
  let tree;
  try {
    await act(() => { tree = create(render("letter-wave")); });
    const title = tree.root.findByType(AnimatedTitle);
    expect(title.props).toMatchObject({ effect: "letter-wave", fontSize: 72, textStyle: { lineHeight: 100 } });
    expect(title.props.clock).toBeUndefined();
    const screenshotStep = showLinks ? 2 : 1;
    for (const step of [0, ...(showLinks ? [1] : []), screenshotStep, screenshotStep + 1, screenshotStep + 2, screenshotStep, 0]) {
      await act(() => runtime$.stepIndex.set(step));
      expect(tree.root.findByType(AnimatedTitle)).toBe(title);
      expect(tree.root.findAllByType(MovingTitle)).toHaveLength(0);
      expect(tree.root.findByType(ScenePositionView).props.y).toBe(step === 0 ? 390 : 0);
      expect(tree.root.findAllByType("image")[0].props.source.uri).toBe("slides.png");
      expect(tree.root.findAllByType("features")).toHaveLength(step === screenshotStep + 1 ? 1 : 0);
      expect(tree.root.findAllByType("authoring")).toHaveLength(step === screenshotStep + 2 ? 1 : 0);
      expect(tree.root.findAllByType("github-link")).toHaveLength(showLinks && step === 1 ? 1 : 0);
      expect(tree.root.findByType("shader").props.uniforms.value.screenshotStep).toBe(screenshotStep);
    }
    await act(() => tree.update(render(undefined)));
    expect(tree.root.findAllByType(AnimatedTitle)).toHaveLength(0);
    expect(tree.root.findAllByType(MovingTitle)).toHaveLength(1);
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});

const { SlidesFeatures } = load(`${import.meta.dir}/../SlidesFeatures.tsx`, {
  "./StoryDiagrams": { SlidesHeader },
});

test("feature demos and moving tile contents occupy a foreground layer above their glass", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: false, isPreview: true, isPreparing: false,
    slideIndex: 0, stepIndex: 2, stepCount: 4, stepEpochs: {} });
  let tree;
  try {
    await act(() => {
      tree = create(<PresentationProvider value={runtime$}>
        <SlidesFeatures icon="slides.png" showHeader={false}><particles /></SlidesFeatures>
      </PresentationProvider>);
    });
    const glass = tree.root.findAllByType(GlassPanels).find(node => node.props.width === 1696);
    const foreground = tree.root.findAllByType("view").find(node => node.props.style?.inset === 0 && node.props.style.zIndex === 1);
    expect(foreground).toBeDefined();
    expect(foreground.parent).toBe(glass.parent);
    expect(foreground.findAllByType("text").map(node => node.props.children)).toEqual(["Reanimated", "Skia", "TypeGPU"]);
    expect(foreground.findAllByType("canvas")).toHaveLength(4);
    expect(foreground.findAllByType("particles")).toHaveLength(1);
    const shapes = foreground.findAllByType("view").filter(node => node.props.style?.backgroundColor);
    expect(shapes).toHaveLength(3);
    expect(shapes.every(node => node.props.style.zIndex === 1)).toBe(true);
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
