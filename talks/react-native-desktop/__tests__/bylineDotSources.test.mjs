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
    expect(bylineDotSources(pixels, width, height)).toEqual({ offsetY: 0, sources: [849, bylineTop + 46, 1059, bylineTop + 46] });
    ink(1280, 37, 1298, 55);
    expect(bylineDotSources(pixels, width, height)).toBeNull();
  }
});

test("byline dots align with capital ink even when line padding and descenders differ", () => {
  for (const scale of [1, 2, 3]) {
    const width = 1920 * scale, height = bylineHeight * scale;
    const capture = dotTop => {
      const pixels = new Uint8Array(width * height * 4);
      const ink = (left, top, right, bottom) => {
        for (let y = top * scale; y < bottom * scale; y++) for (let x = left * scale; x < right * scale; x++) {
          pixels[(y * width + x) * 4 + 3] = 255;
        }
      };
      ink(600, 34, 625, 74); // Capital J.
      ink(640, 45, 680, 88); // Descender in Jay.
      ink(760, dotTop, 778, dotTop + 18);
      ink(800, 34, 940, 88); // Legend includes a descender.
      ink(1000, dotTop, 1018, dotTop + 18);
      ink(1040, 34, 1260, 88);
      return bylineDotSources(pixels, width, height);
    };
    const initial = capture(20);
    expect(initial).toEqual({ offsetY: 25, sources: [769, bylineTop + 54, 1009, bylineTop + 54] });
    expect(capture(20 + initial.offsetY)).toEqual({ offsetY: 0, sources: initial.sources });
  }
});
