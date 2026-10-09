/** Locate the lower glyph contours in the captured, transparent title image. */
export function titleDripAnchors(pixels: Uint8Array, width: number, height: number) {
  const ink = (x: number, y: number) => pixels[(y * width + x) * 4 + 3] > 128;
  const rows: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) if (ink(x, y)) { rows.push(y); break; }
  }
  if (!rows.length) return null;
  // Dots above i are separate ink bands, not separate lines. Use the largest
  // inter-row gap to split the two lines, retaining all second-line accents.
  let start = 1;
  for(let i=2;i<rows.length;i++) if(rows[i]-rows[i-1]>rows[start]-rows[start-1]) start=i;
  if(rows[start]-rows[start-1]<3) return null;
  const top = rows[start], bottom = rows[rows.length - 1];
  const lineSplit=(rows[start-1]+top)*0.5*1080/height;
  const runs: [number, number][] = [];
  let left = -1;
  for (let x = 0; x <= width; x++) {
    let occupied = false;
    if (x < width) for (let y = top; y <= bottom; y++) if (ink(x, y)) { occupied = true; break; }
    if (occupied && left < 0) left = x;
    if (!occupied && left >= 0) { runs.push([left, x - 1]); left = -1; }
  }
  if (runs.length < 8) return null;
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
  let measured: {bestRect?: number[]; bestInkRect?: number[]; absorptionTargets?: number[][]}={};
  if(firstRuns.length>=8) {
    const i=firstRuns.length-7;
    const x0=(firstRuns[i-1][1]+firstRuns[i][0])/2;
    const x1=(firstRuns[i+3][1]+firstRuns[i+4][0])/2;
    measured={bestRect:[x0*1920/width,(firstTop-6)*1080/height,(x1-x0)*1920/width,(firstBottom-firstTop+12)*1080/height]};
    const targets:number[][]=[];
    for(let glyph=i;glyph<i+4;glyph++) {
      const [left,right]=firstRuns[glyph];
      for(let sample=0;sample<4;sample++) {
        const x=Math.round(left+(right-left)*(sample+.5)/4);
        for(let y=firstTop;y<=firstBottom;y++) if(ink(x,y)) {targets.push([x*1920/width,y*1080/height]);break;}
        for(let y=firstBottom;y>=firstTop;y--) if(ink(x,y)) {targets.push([x*1920/width,y*1080/height]);break;}
        const y=Math.round(firstTop+(firstBottom-firstTop)*(sample+.5)/4);
        for(let x=left;x<=right;x++) if(ink(x,y)) {targets.push([x*1920/width,y*1080/height]);break;}
        for(let x=right;x>=left;x--) if(ink(x,y)) {targets.push([x*1920/width,y*1080/height]);break;}
      }
    }
    measured.absorptionTargets=targets;
    let inkTop=firstBottom,inkBottom=firstTop;
    for(let y=firstTop;y<=firstBottom;y++) for(let x=firstRuns[i][0];x<=firstRuns[i+3][1];x++) if(ink(x,y)){inkTop=Math.min(inkTop,y);inkBottom=Math.max(inkBottom,y);}
    measured.bestInkRect=[firstRuns[i][0]*1920/width,inkTop*1080/height,(firstRuns[i+3][1]-firstRuns[i][0]+1)*1920/width,(inkBottom-inkTop+1)*1080/height];
  }
  const glyphs:number[]=[];
  for(const [lineRuns,y0,y1] of [[firstRuns,firstTop,firstBottom],[runs,top,bottom]] as const) {
    for(const [x0,x1] of lineRuns) {
      glyphs.push((x0-1)*1920/width,(y0-1)*1080/height,(x1-x0+3)*1920/width,(y1-y0+3)*1080/height);
    }
  }
  const glyphCount=Math.min(64,glyphs.length/4);
  while(glyphs.length<256) glyphs.push(0);
  // The eighth glyph in "to build desktop apps" is desktop's d.
  return { ...measured, lineSplit, glyphCount, glyphs: glyphs.slice(0,256), leftSource: anchor(runs[1]), rightSource: anchor(runs[runs.length - 3]), thirdSource: anchor(runs[runs.length - 2]), desktopSource: anchor(runs[7]) };
}
