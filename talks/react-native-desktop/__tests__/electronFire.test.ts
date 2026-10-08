// @ts-nocheck Native module loading is mocked; the shader renders in real Skia.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { electronFireShader } from "../ElectronFire";

test("fire compiles in Skia, ignites from transparent, and moves its flames and embers", async () => {
  const require = createRequire(new URL("../../../package.json", import.meta.url));
  const skiaRequire = createRequire(require.resolve("@shopify/react-native-skia"));
  const entry = skiaRequire.resolve("canvaskit-wasm");
  const kit = await skiaRequire("canvaskit-wasm")({ locateFile: file => join(dirname(entry), file) });
  const errors = [];
  const effect = kit.RuntimeEffect.Make(electronFireShader, error => errors.push(error));
  expect(errors).toEqual([]);
  expect(effect).not.toBeNull();
  const width = 240, height = 280;
  const surface = kit.MakeSurface(width, height);
  const paint = new kit.Paint();
  function render(time) {
    const canvas = surface.getCanvas();
    canvas.clear(kit.TRANSPARENT);
    const shader = effect.makeShader([time, 128]);
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
    let hotCore = 0, sparks = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const [r, g, , a] = burning.subarray(offset, offset + 4);
      if (y > 160 && r > 240 && g > 190 && a > 150) hotCore++;
      if (y < 65 && r > 200 && g > 80 && a > 15) sparks++;
    }
    expect(hotCore).toBeGreaterThan(100);
    expect(sparks).toBeGreaterThan(5);
  } finally {
    paint.delete();
    surface.delete();
    effect.delete();
  }
}, 30000);
