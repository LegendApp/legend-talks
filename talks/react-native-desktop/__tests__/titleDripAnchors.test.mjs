import { expect, test } from "bun:test";
import { titleDripAnchors } from "../titleDripAnchors.ts";

test("desktop drip anchors to the d contour at either capture scale", () => {
  for (const scale of [1, 2]) {
    const width = 1920 * scale, height = 1080 * scale;
    const pixels = new Uint8Array(width * height * 4);
    const ink = (left, top, right, bottom) => {
      for (let y = top * scale; y < bottom * scale; y++) for (let x = left * scale; x < right * scale; x++) {
        pixels[(y * width + x) * 4 + 3] = 255;
      }
    };
    ink(300, 400, 1500, 480);
    for (let glyph = 0; glyph < 18; glyph++) ink(300 + glyph * 60, 560, 340 + glyph * 60, 640);
    ink(300 + 7 * 60 + 10, 640, 300 + 7 * 60 + 30, 646);
    ink(300 + 12 * 60, 640, 340 + 12 * 60, 665);
    const anchors = titleDripAnchors(pixels, width, height);
    expect(anchors.desktopSource[0]).toBeCloseTo(740 - 0.5 / scale);
    expect(anchors.desktopSource[1]).toBeCloseTo(644 - 1 / scale);
  }
});
