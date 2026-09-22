/** Locate the lower glyph contours in the captured, transparent title image. */
export function titleDripAnchors(pixels: Uint8Array, width: number, height: number) {
  const ink = (x: number, y: number) => pixels[(y * width + x) * 4 + 3] > 128;
  const rows: number[] = [];
  for (let y = Math.floor(height / 2); y < height; y++) {
    for (let x = 0; x < width; x++) if (ink(x, y)) { rows.push(y); break; }
  }
  if (!rows.length) return null;
  let start = rows.length - 1;
  while (start > 0 && rows[start] - rows[start - 1] <= 2) start--;
  const top = rows[start], bottom = rows[rows.length - 1];
  const runs: [number, number][] = [];
  let left = -1;
  for (let x = 0; x <= width; x++) {
    let occupied = false;
    if (x < width) for (let y = top; y <= bottom; y++) if (ink(x, y)) { occupied = true; break; }
    if (occupied && left < 0) left = x;
    if (!occupied && left >= 0) { runs.push([left, x - 1]); left = -1; }
  }
  if (runs.length < 6) return null;
  const anchor = ([left, right]: [number, number]) => {
    for (let y = bottom; y >= top; y--) {
      let sum = 0, count = 0;
      for (let x = left; x <= right; x++) if (ink(x, y)) { sum += x; count++; }
      if (count) return [sum / count * 1920 / width, y * 1080 / height - 2];
    }
    return [0, 0];
  };
  // Measure the first line independently, including whitespace around best.
  let firstTop = -1, firstBottom = -1;
  for (let y = 0; y < top; y++) {
    let occupied = false;
    for (let x = 0; x < width; x++) if (ink(x,y)) { occupied=true; break; }
    if(occupied) { if(firstTop<0) firstTop=y; firstBottom=y; }
  }
  const firstRuns: [number,number][]=[];
  let run=-1;
  for(let x=0;x<=width;x++) {
    let occupied=false;
    if(x<width) for(let y=firstTop;y<=firstBottom;y++) if(y>=0 && ink(x,y)) { occupied=true; break; }
    if(occupied && run<0) run=x;
    if(!occupied && run>=0) { firstRuns.push([run,x-1]);run=-1; }
  }
  let measured: {bestRect?: number[]}={};
  if(firstRuns.length>=8) {
    const i=firstRuns.length-7;
    const x0=(firstRuns[i-1][1]+firstRuns[i][0])/2;
    const x1=(firstRuns[i+3][1]+firstRuns[i+4][0])/2;
    measured={bestRect:[x0*1920/width,(firstTop-6)*1080/height,(x1-x0)*1920/width,(firstBottom-firstTop+12)*1080/height]};
  }
  return { ...measured, leftSource: anchor(runs[1]), rightSource: anchor(runs[runs.length - 3]), thirdSource: anchor(runs[runs.length - 2]) };
}
