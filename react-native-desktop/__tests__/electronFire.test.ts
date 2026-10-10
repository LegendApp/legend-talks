// @ts-nocheck Native module loading is mocked; the shader renders in real Skia.
import "../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { observable } from "@legendapp/state";
import { FocusSurfaceContext, GPUShaderProvider, PresentationProvider, createFocusSurface } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import * as skia from "@shopify/react-native-skia";

const deckRequire = createRequire(new URL("../ElectronFire.tsx", import.meta.url));
const { transformSync } = createRequire(new URL("../../test-support/legend-apps/packages/presentation/package.json", import.meta.url))("esbuild");
const module = { exports: {} };
const fireFile = new URL("../../test-support/legend-apps/packages/slides-effects/packs/materials/Fire.tsx", import.meta.url);
const fireCode = transformSync(readFileSync(fireFile, "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
const fire = { exports: {} };
Function("require", "module", "exports", fireCode)(name => name === "@shopify/react-native-skia"
  ? { ...skia, ImageShader: "image-shader", useImage: () => ({}) } : createRequire(fireFile)(name), fire, fire.exports);
const code = transformSync(readFileSync(new URL("../ElectronFire.tsx", import.meta.url), "utf8"), { loader: "tsx", format: "cjs", jsx: "automatic" }).code;
Function("require", "module", "exports", code)(name => name === "slides:materials/Fire" ? fire.exports
  : name.endsWith(".png") ? name : deckRequire(name), module, module.exports);
const { ElectronFire } = module.exports;
const electronFireShader = fire.exports.flameSource;

test("fire builds over five seconds with deterministic moving flames", async () => {
  const require = createRequire(new URL("../../test-support/legend-apps/apps/slides/package.json", import.meta.url));
  const skiaRequire = createRequire(require.resolve("@shopify/react-native-skia"));
  const entry = skiaRequire.resolve("canvaskit-wasm");
  const kit = await skiaRequire("canvaskit-wasm")({ locateFile: file => join(dirname(entry), file) });
  const errors = [];
  const effect = kit.RuntimeEffect.Make(electronFireShader, error => errors.push(error));
  expect(errors).toEqual([]); expect(effect).not.toBeNull();
  const width=624,height=824,surface=kit.MakeSurface(width,height),paint=new kit.Paint();
  function render(time) {
    const shader=effect.makeShader([time,368,30]);
    surface.getCanvas().clear(kit.TRANSPARENT); paint.setShader(shader);
    surface.getCanvas().drawRect(kit.XYWHRect(0,0,width,height),paint);surface.flush();
    const image=surface.makeImageSnapshot();
    try {return Uint8Array.from(image.readPixels(0,0,{width,height,alphaType:kit.AlphaType.Unpremul,colorType:kit.ColorType.RGBA_8888,colorSpace:kit.ColorSpace.SRGB}));}
    finally {image.delete();paint.setShader(null);shader.delete();}
  }
  const alphaIn=(frame,top,bottom)=>{
    let sum=0;for(let y=top;y<bottom;y++)for(let x=128;x<496;x++)sum+=frame[(y*width+x)*4+3];return sum;
  };
  try {
    expect(render(0).every(byte=>byte===0)).toBe(true);
    expect(render(2.4)).not.toEqual(render(2.9));
    expect(render(2.4)).toEqual(render(2.4));
    const ignition=render(1),rising=render(3),full=render(5.4);
    expect(alphaIn(ignition,60,130)).toBe(0);
    expect(alphaIn(rising,60,130)).toBeGreaterThan(1000);
    expect(alphaIn(full,0,235)).toBeGreaterThan(alphaIn(ignition,0,235)*5);
  } finally {paint.delete();surface.delete();effect.delete();}
},30000);

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
          React.createElement(GPUShaderProvider, {renderer:props=>React.createElement("gpu",props)}, React.createElement(ElectronFire, { width: 618, barHeight: 30, x: 285, y: 175.5, layer: "drops" })))), {
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
      expect(tree.root.findByType("view").props.style.zIndex).toBe(1);
      const gpu=tree.root.findByType("gpu").props;
      expect(gpu.height + offset).toBe(height);
      expect(gpu.previewTime).toBe(5.4);
      expect(gpu.image).toBeTruthy();
      expect(gpu.particles).toBe(true);
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
