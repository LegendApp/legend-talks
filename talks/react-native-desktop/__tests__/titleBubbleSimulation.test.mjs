import {test,expect} from "bun:test";
import {createTitleBubbles,advanceTitleBubbles,beginTitleRelease,advanceTitleRelease,titleCenterProgress,titleMaxScale} from "../titleBubbleSimulation.ts";
const rect=[1200,400,260,120],targets=[[1230,420],[1300,420],[1360,420],[1430,420]];
test("growth is caused by absorption, not elapsed time",()=>{
 let state=createTitleBubbles();
 state=advanceTitleBubbles(state,1,.288,rect,targets);
 expect(state.volume).toBe(0);expect(state.scale).toBe(1);
 for(let i=1;i<25*60;i++) state=advanceTitleBubbles(state,1/60,(1+i/60)*.288,rect,targets);
 expect(state.volume).toBeGreaterThan(0);expect(state.scale).toBeGreaterThan(1);
 expect(state.drops.every(d=>Number.isFinite(d.x)&&Number.isFinite(d.y))).toBe(true);
});
test("detached bubbles stay foreground until absorption",()=>{
 let state=createTitleBubbles();state=advanceTitleBubbles(state,1.5,.432,rect,targets);
 expect(state.drops[0].phase).toBe(1);
 expect(state.drops[0].radius).toBeGreaterThan(0);
});

test("deck compiler preserves title and carousel worklets", async()=>{
 const {compileDeck}=await import("../../../test-support/legend-apps/packages/presentation/src/compiler/index.ts");
 const {fileURLToPath}=await import("node:url");
 for (const deck of ["rnconnection.mdx", "talk.mdx"]) {
  const result=await compileDeck(fileURLToPath(new URL("../"+deck,import.meta.url)));
  expect(result).toMatchObject({success:true});
  if (deck === "rnconnection.mdx") {
   expect(result.code.includes("__workletHash")).toBe(true);
   expect(result.dependencies.some(file=>file.endsWith("/FilmstripMotionView.tsx"))).toBe(true);
   expect(result.dependencies.some(file=>file.endsWith("/titleBubbleSimulation.ts"))).toBe(true);
  }
 }
}, 30000);

test("bubbles below a glyph are absorbed at its lower contour",()=>{
 const initial=createTitleBubbles();
 initial.drops[0]={...initial.drops[0],phase:1,age:0,x:1330,y:525,radius:19};
 const state=advanceTitleBubbles(initial,1/120,0,rect,[[1330,410],[1330,510]]);
 expect(state.drops[0].phase).toBe(2);
 expect(state.drops[0].hitY).toBe(510);
});

test("growth stays within slide margins even with excess volume and momentum",()=>{
 const initial=createTitleBubbles();initial.volume=10000;initial.scale=3.49;initial.velocity=100;
 const state=advanceTitleBubbles(initial,1/60,0,rect,targets);
 expect(state.scale).toBeLessThanOrEqual(4);
 expect(state.scale*rect[2]*1.065).toBeLessThanOrEqual(1650);
 expect(state.scale*rect[3]*1.065).toBeLessThanOrEqual(756);
});


test("release removes mass only when a bud detaches",()=>{
 const initial=createTitleBubbles();initial.scale=3;
 let state=beginTitleRelease(initial,rect);
 state=advanceTitleRelease(state,.3,rect,targets);
 expect(state.volume).toBe(9);
 expect(state.drops[0].phase).toBe(3);
 for(let i=0;i<600;i++) state=advanceTitleRelease(state,1/60,rect,targets);
 expect(state.volume).toBeLessThan(.0001);
 expect(state.scale).toBeLessThan(.01);
 expect(state.drops.every(d=>d.phase===5)).toBe(true);
});


test("release emits more bubbles while retaining mass through the old exit duration",()=>{
 const initial=createTitleBubbles();initial.scale=3;
 let state=beginTitleRelease(initial,rect);
 expect(state.drops.length).toBe(72);
 for(let i=0;i<150;i++)state=advanceTitleRelease(state,1/60,rect,targets);
 expect(state.volume).toBeGreaterThan(4);
 expect(state.drops.filter(d=>d.phase>=4).length).toBeGreaterThan(18);
});

test("title reaches center only at its size cap",()=>{
 expect(titleCenterProgress(1,rect)).toBe(0);
 expect(titleCenterProgress(2.5,rect)).toBeCloseTo(.5);
 expect(titleCenterProgress(titleMaxScale(rect),rect)).toBe(1);
});

test("byline bubbles bud at both dots, detach, and contribute only on absorption",()=>{
 const sources=[840,810,1050,810];
 let state=createTitleBubbles(true);
 const seen=[new Set(),new Set()];
 let absorbed=false;
 for(let frame=0;frame<1200;frame++) {
  const previous=state;
  state=advanceTitleBubbles(state,1/120,frame/120*.288,rect,targets,sources);
  for(let index=16;index<18;index++) {
   const drop=state.drops[index];
   seen[index-16].add(drop.phase);
   if(drop.phase===6 && drop.radius>0) {
    expect(drop.x).toBe(sources[(index-16)*2]);
    expect(drop.y).toBeLessThan(sources[(index-16)*2+1]);
   }
   if(previous.drops[index].phase===1 && drop.phase===2) {
    absorbed=true;
    expect(state.volume).toBeGreaterThan(previous.volume);
    expect(targets.some(([x,y])=>x===drop.hitX && y===drop.hitY)).toBe(true);
   }
  }
 }
 expect(seen.every(phases=>[6,1,2].every(phase=>phases.has(phase)))).toBe(true);
 expect(absorbed).toBe(true);
 expect(state.drops.every(drop=>Number.isFinite(drop.x)&&Number.isFinite(drop.y))).toBe(true);
});

test("byline stops emitting when the growing title hides it",()=>{
 const state=createTitleBubbles(true);state.scale=titleMaxScale(rect);state.volume=state.scale**2-1;
 state.drops[16].age=0;state.drops[17].age=0;
 const next=advanceTitleBubbles(state,2,0,rect,targets,[840,810,1050,810]);
 expect(next.drops.slice(16).every(drop=>drop.phase===6 && drop.radius===0)).toBe(true);
});

test("byline waits for capture without spawning from a background parent",()=>{
 const initial=createTitleBubbles(true);
 const waiting=advanceTitleBubbles(initial,3,0,rect,targets,[],true);
 expect(waiting.drops.slice(16)).toEqual(initial.drops.slice(16));
 const ready=advanceTitleBubbles(waiting,.5,0,rect,targets,[840,810,1050,810],true);
 expect(ready.drops[16].phase).toBe(6);
 expect(ready.drops[16].x).toBe(840);
});
