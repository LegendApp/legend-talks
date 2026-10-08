// @ts-nocheck Native module loading is mocked; the shader renders in real Skia.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { observable } from "@legendapp/state";
import { FocusSurfaceContext, PresentationProvider, createFocusSurface } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import * as skia from "@shopify/react-native-skia";

const deckRequire = createRequire(new URL("../ElectronFire.tsx", import.meta.url));
const { transformSync } = createRequire(new URL("../../../../../packages/presentation/package.json", import.meta.url))("esbuild");
const module = { exports: {} };
const code = transformSync(readFileSync(new URL("../ElectronFire.tsx", import.meta.url), "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
Function("require", "module", "exports", code)(name => name === "@shopify/react-native-skia"
  ? { ...skia, ImageShader: "image-shader", useImage: () => ({}) }
  : name.endsWith(".png") ? name : deckRequire(name), module, module.exports);
const { ElectronFire, electronFireShader } = module.exports;

test("fire builds over five seconds while varied poop emojis fall, splash, and keep accumulating", async () => {
  const require = createRequire(new URL("../../../package.json", import.meta.url));
  const skiaRequire = createRequire(require.resolve("@shopify/react-native-skia"));
  const entry = skiaRequire.resolve("canvaskit-wasm");
  const kit = await skiaRequire("canvaskit-wasm")({ locateFile: file => join(dirname(entry), file) });
  const errors = [];
  const effect = kit.RuntimeEffect.Make(electronFireShader, error => errors.push(error));
  expect(errors).toEqual([]);
  expect(effect).not.toBeNull();
  const emoji = kit.MakeImageFromEncoded(readFileSync(new URL("../rnconnection-assets/poop.png", import.meta.url)));
  const emojiShader = emoji.makeShaderOptions(kit.TileMode.Clamp, kit.TileMode.Clamp, kit.FilterMode.Linear, kit.MipmapMode.None);
  const fireWidth = 368, width = fireWidth + 224, height = 824, floorY = 800;
  const surface = kit.MakeSurface(width, height);
  const paint = new kit.Paint();
  function render(time) {
    const canvas = surface.getCanvas();
    canvas.clear(kit.TRANSPARENT);
    const shader = effect.makeShaderWithChildren([time, fireWidth, 30, floorY], [emojiShader]);
    paint.setShader(shader);
    canvas.drawRect(kit.XYWHRect(0, 0, width, height), paint);
    surface.flush();
    const image = surface.makeImageSnapshot();
    try {
      return Uint8Array.from(image.readPixels(0, 0, { width, height, alphaType: kit.AlphaType.Unpremul,
        colorType: kit.ColorType.RGBA_8888, colorSpace: kit.ColorSpace.SRGB }));
    } finally {
      image.delete();
      paint.setShader(null);
      shader.delete();
    }
  }
  try {
    expect(render(0).every(byte => byte === 0)).toBe(true);
    const burning = render(2.4);
    expect(burning).not.toEqual(render(2.9));
    expect(burning).toEqual(render(2.4));
    const early = render(1.0);
    const fullyBurning = render(5.4);
    let earlyFire = 0, fullFire = 0;
    let hotCore = 0, sparks = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const [r, g, , a] = fullyBurning.subarray(offset, offset + 4);
      if (y > 160 && r > 240 && g > 190 && a > 150) hotCore++;
      if (y < 65 && r > 200 && g > 80 && a > 15) sparks++;
      if (y < 235) { earlyFire += early[offset + 3]; fullFire += a; }
    }
    expect(hotCore).toBeGreaterThan(100);
    expect(sparks).toBeGreaterThan(5);
    expect(earlyFire).toBeGreaterThan(0);
    expect(fullFire).toBeGreaterThan(earlyFire * 5);
    const areas = [];
    let deepDrops = 0, splashes = 0, faces = 0;
    for (const frame of [burning, render(2.0), render(3.1), fullyBurning]) {
      const lanes = [0, 0, 0, 0];
      for (let y = 270; y < height; y++) for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const [r, g, b, a] = frame.subarray(offset, offset + 4);
        if (r > 40 && r < 220 && g > 15 && r > g * 1.1 && g > b * 1.2 && a > 150) {
          if (y < floorY - 120 && x >= 112 && x < 112 + fireWidth) lanes[Math.floor((x - 112) / 92)]++;
          if (y > 500 && y < floorY - 120) deepDrops++;
          if (y > floorY - 100) splashes++;
        }
        if (r > 220 && g > 220 && b > 220 && a > 150) faces++;
      }
      areas.push(...lanes.filter(area => area > 10));
    }
    expect(deepDrops).toBeGreaterThan(20);
    expect(splashes).toBeGreaterThan(30);
    expect(faces).toBeGreaterThan(20);
    expect(Math.max(...areas)).toBeGreaterThan(Math.min(...areas) * 2);
    const accumulated = render(16.0);
    let oldDeposit = 0, initialPile = 0, laterPile = 0;
    for (let y = floorY - 140; y < height; y++) for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4 + 3;
      if (fullyBurning[offset] > 80) initialPile++;
      if (accumulated[offset] > 80) laterPile++;
      if (y >= floorY - 1 && fullyBurning[offset] > 80) {
        oldDeposit++;
        expect(accumulated[offset]).toBeGreaterThanOrEqual(fullyBurning[offset] - 1);
      }
    }
    expect(oldDeposit).toBeGreaterThan(10);
    expect(laterPile).toBeGreaterThan(initialPile * 1.4);
  } finally {
    paint.delete();
    surface.delete();
    effect.delete();
    emojiShader.delete();
    emoji.delete();
  }
}, 60000);

test("the drop floor follows the logical slide bottom rather than chart bounds or display scaling", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: false, isPreview: true, isPreparing: false,
    slideIndex: 0, stepIndex: 1, stepCount: 2, stepEpochs: {} });
  const surface = createFocusSurface();
  const root = {};
  surface.setRoot(root);
  surface.setLayout({ width: 1920, height: 1080 });
  surface.scale = 0.5;
  let top = 220;
  let tree;
  try {
    await act(() => {
      tree = create(React.createElement(PresentationProvider, { value: runtime$ },
        React.createElement(FocusSurfaceContext.Provider, { value: { surface } },
          React.createElement(ElectronFire, { width: 618, barHeight: 30, x: 285, y: 175.5 }))), {
        createNodeMock: () => ({ measureLayout: (relativeTo, done) => {
          expect(relativeTo).toBe(root);
          done(173, top, 842, 214);
        } }),
      });
    });
    for (const [height, offset, scale] of [[1080, 220, 0.5], [1080, 220, 0.25], [1200, 300, 0.5]]) {
      top = offset;
      surface.scale = scale;
      surface.setLayout({ width: 1920, height });
      await act(() => tree.root.findByType("view").props.onLayout());
      const floor = tree.root.findByType("shader").props.uniforms.value;
      expect(floor.floorY + offset).toBe(height - 24);
      expect(tree.root.findByType("canvas").props.style.height + offset).toBe(height);
      expect(floor.time).toBe(5.4);
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
