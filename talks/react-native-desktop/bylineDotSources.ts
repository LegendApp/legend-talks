export const bylineTop = 928;
export const bylineHeight = 96;

/** Locate the two short ink runs independently of font and capture scale. */
export function bylineDotSources(pixels: Uint8Array, width: number, height: number) {
  const runs: { left: number; right: number; top: number; bottom: number }[] = [];
  let run: typeof runs[number] | undefined;
  for (let x = 0; x <= width; x++) {
    let top = height, bottom = -1;
    if (x < width) for (let y = 0; y < height; y++) {
      if (pixels[(y * width + x) * 4 + 3] > 128) { top = Math.min(top, y); bottom = y; }
    }
    if (bottom >= 0) {
      if (!run) run = { left: x, right: x, top, bottom };
      run.right = x; run.top = Math.min(run.top, top); run.bottom = Math.max(run.bottom, bottom);
    } else if (run) { runs.push(run); run = undefined; }
  }
  const dots = runs.filter(run => (run.bottom - run.top + 1) * bylineHeight / height < 20);
  if (dots.length !== 2) return null;
  return dots.flatMap(dot => [
    (dot.left + dot.right + 1) * 960 / width,
    bylineTop + (dot.top + dot.bottom + 1) * bylineHeight / (2 * height),
  ]);
}
