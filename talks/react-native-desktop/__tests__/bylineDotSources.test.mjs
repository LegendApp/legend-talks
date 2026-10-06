import { expect, test } from "bun:test";
import { bylineDotSources } from "../bylineDotSources.ts";

test("byline anchors follow the separator ink at either capture scale", () => {
  for (const scale of [1, 2]) {
    const width = 1920 * scale, height = 64 * scale;
    const pixels = new Uint8Array(width * height * 4);
    const ink = (left, top, right, bottom) => {
      for (let y = top * scale; y < bottom * scale; y++) for (let x = left * scale; x < right * scale; x++) {
        pixels[(y * width + x) * 4 + 3] = 255;
      }
    };
    ink(700, 12, 740, 48);
    ink(840, 29, 846, 35);
    ink(870, 12, 980, 48);
    ink(1050, 29, 1056, 35);
    ink(1080, 12, 1200, 48);
    expect(bylineDotSources(pixels, width, height)).toEqual([843, 812, 1053, 812]);
    ink(1280, 29, 1286, 35);
    expect(bylineDotSources(pixels, width, height)).toBeNull();
  }
});
