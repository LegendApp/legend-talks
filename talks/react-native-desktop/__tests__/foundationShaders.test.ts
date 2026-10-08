// @ts-nocheck Execute the deck's shader source in real Skia without native imports.
import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

function shader(file, name, dependencies = {}) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const expression = source.match(new RegExp("export const " + name + " = (`[\\s\\S]*?`);"))[1];
  return Function(...Object.keys(dependencies), `return ${expression}`)(...Object.values(dependencies));
}

test("the narrow Spark ribbon canvas preserves its full-size pixels throughout the reveal", async () => {
  const require = createRequire(new URL("../../../package.json", import.meta.url));
  const skiaRequire = createRequire(require.resolve("@shopify/react-native-skia"));
  const entry = skiaRequire.resolve("canvaskit-wasm");
  const kit = await skiaRequire("canvaskit-wasm")({ locateFile: file => join(dirname(entry), file) });
  const source = readFileSync(new URL("../FramePitch.tsx", import.meta.url), "utf8");
  const [, left, canvasWidth, canvasHeight] = source.match(/<View style=\{\{ position: "absolute", left: (\d+), top: 0, width: (\d+), height: (\d+) \}\}><PresentationCanvas width=\{\d+\} height=\{\d+\}><Fill><Shader source=\{branches/).map(Number);
  const offset = Number(source.match(/branchUniforms = useAnimatedShaderUniforms\(\{ offsetX: (\d+)/)[1]);
  const errors = [];
  const effect = kit.RuntimeEffect.Make(shader("FramePitch.tsx", "foundationBranchesShader", {
    rootRibbonShader: shader("SharedRoots.tsx", "rootRibbonShader"),
  }), error => errors.push(error));
  expect(errors).toEqual([]);
  expect(effect).not.toBeNull();
  const width = 240, height = 135;
  const surface = kit.MakeSurface(width, height), paint = new kit.Paint();
  function render(time, cropped) {
    const canvas = surface.getCanvas();
    canvas.clear(kit.TRANSPARENT);
    canvas.save();
    canvas.scale(1 / 8, 1 / 8);
    if (cropped) canvas.translate(left, 0);
    const material = effect.makeShader([time, cropped ? offset : 0]);
    paint.setShader(material);
    canvas.drawRect(kit.XYWHRect(0, 0, cropped ? canvasWidth : 1920, cropped ? canvasHeight : 1080), paint);
    canvas.restore();
    surface.flush();
    const image = surface.makeImageSnapshot();
    const pixels = Uint8Array.from(image.readPixels(0, 0, { width, height, alphaType: kit.AlphaType.Premul,
      colorType: kit.ColorType.RGBA_8888, colorSpace: kit.ColorSpace.SRGB }));
    image.delete();
    paint.setShader(null);
    material.delete();
    return pixels;
  }
  try {
    expect(render(0, true).every(byte => byte === 0)).toBe(true);
    for (const time of [.55, 1, 2.4, 3.8, 5, 50.6]) {
      const full = render(time, false), cropped = render(time, true);
      let maximumDifference = 0;
      for (let i = 0; i < full.length; i++) maximumDifference = Math.max(maximumDifference, Math.abs(full[i] - cropped[i]));
      expect(maximumDifference).toBeLessThanOrEqual(1);
      expect(cropped.some(byte => byte > 0)).toBe(true);
    }
    expect(render(5, true)).not.toEqual(render(5.2, true));
  } finally {
    paint.delete(); surface.delete(); effect.delete();
  }
}, 30000);

test("glass strikes retain falling shards and live checks but finish transparent when crossed out", async () => {
  const require = createRequire(new URL("../../../package.json", import.meta.url));
  const skiaRequire = createRequire(require.resolve("@shopify/react-native-skia"));
  const entry = skiaRequire.resolve("canvaskit-wasm");
  const kit = await skiaRequire("canvaskit-wasm")({ locateFile: file => join(dirname(entry), file) });
  const errors = [];
  const effect = kit.RuntimeEffect.Make(shader("DesktopObjections.tsx", "objectionGlassShader", {
    glassPanelMaterial: shader("GlassPanels.tsx", "glassPanelMaterial"),
  }), error => errors.push(error));
  expect(errors).toEqual([]);
  expect(effect).not.toBeNull();
  const width = 240, height = 135;
  const surface = kit.MakeSurface(width, height), paint = new kit.Paint();
  function render(time, resolve, settled = 0, halfHeight = 151) {
    const canvas = surface.getCanvas();
    canvas.clear(kit.TRANSPARENT);
    canvas.save();
    canvas.scale(1 / 8, 1 / 8);
    const material = effect.makeShader([time, time + 10, 1, resolve, settled, 0, 848, halfHeight]);
    paint.setShader(material);
    canvas.drawRect(kit.XYWHRect(0, 0, 1920, 1080), paint);
    canvas.restore();
    surface.flush();
    const image = surface.makeImageSnapshot();
    const pixels = Uint8Array.from(image.readPixels(0, 0, { width, height, alphaType: kit.AlphaType.Premul,
      colorType: kit.ColorType.RGBA_8888, colorSpace: kit.ColorSpace.SRGB }));
    image.delete(); paint.setShader(null); material.delete();
    return pixels;
  }
  try {
    for (const halfHeight of [8, 151]) {
      const striking = render(.17, 0, 0, halfHeight);
      const falling = render(1, 0, 0, halfHeight);
      expect(striking.some(byte => byte > 0)).toBe(true);
      expect(falling.some(byte => byte > 0)).toBe(true);
      expect(falling).not.toEqual(striking);
      expect(render(4.38, 0, 0, halfHeight).every(byte => byte === 0)).toBe(true);
      expect(render(6, 0, 0, halfHeight).every(byte => byte === 0)).toBe(true);
    }
    const check = render(6, 1, 1);
    expect(check.some(byte => byte > 0)).toBe(true);
    expect(render(6.2, 1, 1)).not.toEqual(check);
  } finally {
    paint.delete(); surface.delete(); effect.delete();
  }
}, 30000);
