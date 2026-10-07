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

const { transformSync } = createRequire(new URL("../../../../../packages/presentation/package.json", import.meta.url))("esbuild");
function load(filename, mocks) {
  const require = createRequire(filename);
  const module = { exports: {} };
  const code = transformSync(readFileSync(filename, "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
  Function("require", "module", "exports", code)(name => mocks[name] ?? (name.endsWith(".png") ? name : require(name)), module, module.exports);
  return module.exports;
}
const drawing = { ...skia, Path: "path", ImageShader: "image-shader" };
const links = { GitHubLink: "github-link" };
const { SlidesHeader } = load(`${import.meta.dir}/../StoryDiagrams.tsx`, {
  "./GitHubLink": links, "./RendererWindows": {}, "./ExpoDesktopScene": {}, "./ModuleCompatibility": {},
});
const { SlidesReveal } = load(`${import.meta.dir}/../SlidesReveal.tsx`, {
  "@shopify/react-native-skia": drawing, "./StoryDiagrams": { SlidesHeader }, "./GitHubLink": links,
});

test("Slides title entrance stays mounted through the centered, header, features, and authoring steps", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 5, stepEpochs: {} });
  const render = entrance => <PresentationProvider value={runtime$}><SlidesReveal icon="slides.png"
    titleEntrance={entrance} authoring={<authoring />}><features /></SlidesReveal></PresentationProvider>;
  let tree;
  try {
    await act(() => { tree = create(render("letter-wave")); });
    const title = tree.root.findByType(AnimatedTitle);
    expect(title.props).toMatchObject({ effect: "letter-wave", fontSize: 72, textStyle: { lineHeight: 100 } });
    expect(title.props.clock).toBeUndefined();
    for (const step of [0, 1, 2, 3, 4, 2, 0]) {
      await act(() => runtime$.stepIndex.set(step));
      expect(tree.root.findByType(AnimatedTitle)).toBe(title);
      expect(tree.root.findAllByType(MovingTitle)).toHaveLength(0);
      expect(tree.root.findByType(ScenePositionView).props.y).toBe(step === 0 ? 390 : 0);
      expect(tree.root.findAllByType("image")[0].props.source.uri).toBe("slides.png");
      expect(tree.root.findAllByType("features")).toHaveLength(step === 3 ? 1 : 0);
      expect(tree.root.findAllByType("authoring")).toHaveLength(step === 4 ? 1 : 0);
    }
    await act(() => tree.update(render(undefined)));
    expect(tree.root.findAllByType(AnimatedTitle)).toHaveLength(0);
    expect(tree.root.findAllByType(MovingTitle)).toHaveLength(1);
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
