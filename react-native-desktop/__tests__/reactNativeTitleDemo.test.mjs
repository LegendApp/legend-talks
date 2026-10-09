import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

test("the live window title edits forward, reverses, and repeats on the slide clock", () => {
  const source = readFileSync(new URL("../reactcon-scenes/ReactNativeTitleDemo.tsx", import.meta.url), "utf8");
  const timeline = source.match(/float t=[\s\S]*?(?=  float count=)/)[0].replace(/\bfloat\b/g, "let");
  const sample = Function("time", "min", "max", "floor", "mod", `${timeline}return row;`);
  const rowAt = time => sample(time, Math.min, Math.max, Math.floor, (a, b) => a % b);
  for (const cycle of [0, 1, 2]) {
    const offset = cycle * 11;
    expect(rowAt(offset)).toBe(0);
    expect(rowAt(offset + 1.5)).toBe(1);
    expect(rowAt(offset + 5)).toBe(13);
    expect(rowAt(offset + 6)).toBe(12);
    expect(rowAt(offset + 7.65)).toBe(5);
    expect(rowAt(offset + 8.9)).toBe(0);
    expect(rowAt(offset + 10.9)).toBe(0);
  }
});
