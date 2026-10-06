export const bylineTop = 928;
export const bylineHeight = 96;

/** Center separators on the visible capital J, excluding line padding and descenders. */
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
  const dots = runs.filter(run => (run.bottom - run.top + 1) * bylineHeight / height < 24);
  if (dots.length !== 2) return null;
  const capital = runs[0];
  const centerY = (capital.top + capital.bottom + 1) * bylineHeight / (2 * height);
  const dotY = (dots[0].top + dots[0].bottom + 1) * bylineHeight / (2 * height);
  return { offsetY: centerY - dotY, sources: dots.flatMap(dot => [
    (dot.left + dot.right + 1) * 960 / width,
    bylineTop + centerY,
  ]) };
}
