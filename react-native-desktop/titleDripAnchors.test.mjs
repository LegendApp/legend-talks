import { expect, test } from "bun:test";
import { titleDripAnchors } from "./titleDripAnchors";
test("keeps detached second-line dots below the line split", () => {
  const width=400,height=240,pixels=new Uint8Array(width*height*4);
  const rect=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels[(yy*width+xx)*4+3]=255;};
  for(let i=0;i<10;i++) rect(20+i*30,50,15,30);
  for(let i=0;i<8;i++) rect(40+i*30,130,15,30);
  rect(105,118,5,5);
  const result=titleDripAnchors(pixels,width,height);
  expect(result).not.toBeNull();
  expect(result.lineSplit).toBeGreaterThan(79*1080/height);
  expect(result.lineSplit).toBeLessThan(118*1080/height);
  expect(result.bestRect[1]+result.bestRect[3]).toBeLessThan(118*1080/height);
});
