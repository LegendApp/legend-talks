import { expect, test } from "bun:test";
import { bylineDotSources, bylineHeight, bylineTop } from "../bylineDotSources.ts";

test("byline anchors follow the separator ink at either capture scale", () => {
  for (const scale of [1, 2]) {
    const width = 1920 * scale, height = bylineHeight * scale;
    const pixels = new Uint8Array(width * height * 4);
    const ink = (left, top, right, bottom) => {
      for (let y = top * scale; y < bottom * scale; y++) for (let x = left * scale; x < right * scale; x++) {
        pixels[(y * width + x) * 4 + 3] = 255;
      }
    };
    ink(700, 24, 740, 68);
    ink(840, 37, 858, 55);
    ink(870, 24, 980, 68);
    ink(1050, 37, 1068, 55);
    ink(1080, 24, 1200, 68);
    expect(bylineDotSources(pixels, width, height)).toEqual([849, bylineTop + 46, 1059, bylineTop + 46]);
    ink(1280, 37, 1298, 55);
    expect(bylineDotSources(pixels, width, height)).toBeNull();
  }
});
