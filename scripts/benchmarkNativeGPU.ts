import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { host, root } from "./setup";
import { createGlassStrikeGPU } from "../test-support/legend-apps/packages/slides-effects/packs/materials/GlassStrikeGPU";
import { createSparkCursorProgram } from "../react-native-desktop/reactcon-scenes/SparkParticlesGPU";

const output=path.resolve(process.argv[2] ?? "");
if(!process.argv[2] || process.platform!=="darwin") throw new Error("Usage on macOS: bun --preload ./scripts/effectPacks.ts scripts/benchmarkNativeGPU.ts <output-directory>");
function run(command:string,args:string[],cwd=root) {
  const child=spawnSync(command,args,{cwd,encoding:"utf8",timeout:30_000});
  if(child.status!==0 || child.error) throw new Error(`${command}: ${child.error ?? child.stderr}`);
  return child.stdout;
}
function reserve() {
  let destination=output;
  while(!existsSync(destination)) destination=path.dirname(destination);
  for(const volume of ["/System/Volumes/Data",destination]) {
    const line=run("df",["-k",volume]).trim().split("\n").at(-1)!;
    if(Number(line.trim().split(/\s+/)[3])*1024<=50_064_000_000) throw new Error("Insufficient space for native samples above the 50 GB disk reserve");
  }
}
reserve(); mkdirSync(output,{recursive:true});
const require=createRequire(path.join(host,"apps/slides/package.json"));
const skia=path.dirname(require.resolve("@shopify/react-native-skia/package.json"));
const nativeSkia=path.dirname(createRequire(path.join(skia,"package.json")).resolve("react-native-skia-apple-macos/package.json"));
const webgpu=path.dirname(require.resolve("react-native-webgpu/package.json"));
const frameworks=["Metal","Foundation","QuartzCore","IOSurface","IOKit","CoreGraphics","CoreText","ImageIO"].flatMap(name=>["-framework",name]);
for(const backend of ["skia","dawn"]) {
  reserve();
  const library=backend==="skia" ? path.join(nativeSkia,"libs/libskia.xcframework/macos-arm64_x86_64/libskia.a") : path.join(webgpu,"libs/apple/libwebgpu_dawn.xcframework/macos-arm64_x86_64/libwebgpu_dawn.a");
  run("clang++",["-std=c++17","-O2",...(backend==="skia"?["-DSK_METAL","-DSK_GANESH"]:[]),path.join(root,"scripts/native-gpu",backend==="skia"?"skia.mm":"dawn.cpp"),
    "-I",path.join(backend==="skia"?skia:webgpu,backend==="skia"?"cpp/skia":"cpp/webgpu"),library,...frameworks,"-o",path.join(output,backend)]);
  reserve();
}
const baselineApps="2d61811a",baselineTalks="d592abd";
const material=run("git",["show",`${baselineApps}:packages/slides-effects/packs/materials/GlassPanels.tsx`],host);
const strike=run("git",["show",`${baselineApps}:packages/slides-effects/packs/materials/GlassStrike.tsx`],host);
const foundations=run("git",["show",`${baselineTalks}:react-native-desktop/reactcon-scenes/DesktopFoundations.tsx`]);
function expression(source:string,name:string) {
  const match=source.match(new RegExp(`(?:export )?const ${name} = (\u0060[\\s\\S]*?\u0060);`));
  if(!match) throw new Error("Missing shader "+name);
  return match[1];
}
const glassPanelMaterial=Function("return "+expression(material,"glassPanelMaterial"))();
const geometry=Function("return "+expression(foundations,"geometry"))();
const command=foundations.match(/const command = "([^"]+)"/)![1];
const glassBaseline=Function("glassPanelMaterial","return "+expression(strike,"glassStrikeShader"))(glassPanelMaterial);
const cursorBaseline=Function("geometry","command","atlas","return "+expression(foundations,"frameCursorShader"))(geometry,command,{cell:36});
const fixtures=[
  {name:"glass-strike",width:1920,height:1080,count:55,over:true,times:[.2,.4,.65,1.4,3,6],code:createGlassStrikeGPU(1920,1080),baseline:glassBaseline,
    uniforms:(time:number)=>[time,7,1,1,0,0,396,151],data:(time:number)=>[time,7,1,time,1,1,0,0,396,151,0,0]},
  {name:"spark-cursor",width:2016,height:1000,count:96,over:false,times:[1.05,1.8,2.5,4.5,6],code:createSparkCursorProgram(36,command.length),baseline:cursorBaseline,
    uniforms:(time:number)=>[160,time,5],data:(time:number)=>[time,10,time,5,0,160,0,0]},
];
const results:unknown[]=[];
for(const f of fixtures) {
  const file=(extension:string)=>path.join(output,f.name+extension);
  writeFileSync(file(".sksl"),f.baseline); writeFileSync(file(".wgsl"),f.code);
  const samples=[];
  for(let repetition=0;repetition<5;repetition++) for(const time of f.times) {
    reserve();
    for(const [extension,values] of [[".uniforms",f.uniforms(time)],[".data",f.data(time)]] as const) writeFileSync(file(extension),new Uint8Array(new Float32Array(values).buffer));
    const pair:Record<string,number[][]>={};
    for(const backend of repetition%2?["dawn","skia"]:["skia","dawn"]) {
      const args=backend==="skia"?[file(".sksl"),String(f.width),String(f.height),file(".uniforms"),"15",file("-baseline.rgba")]
        :[file(".wgsl"),String(f.width),String(f.height),file(".data"),String(f.count),"15","1",f.over?"1":"0",file("-candidate.rgba")];
      pair[backend]=run(path.join(output,backend),args).trim().split("\n").map(line=>line.split(",").map(Number));
    }
    const a=readFileSync(file("-baseline.rgba")),b=readFileSync(file("-candidate.rgba"));let difference=0,visible=0;
    for(let i=0;i<a.length;i++) difference+=Math.abs(a[i]-b[i]);
    for(let i=0;i<a.length;i+=4) if(a[i+3] || b[i+3]) visible++;
    if(!visible) throw new Error("Empty native render: "+f.name);
    samples.push({repetition,time,baselineSyncMs:pair.skia.map(s=>s[1]),candidateSyncMs:pair.dawn.map(s=>s[1]),meanAbsoluteByteDifference:difference/a.length});
  }
  results.push({name:f.name,width:f.width,height:f.height,codeSha256:createHash("sha256").update(f.code).digest("hex"),samples});
}
reserve();
writeFileSync(path.join(output,"results.json"),JSON.stringify({baselineApps:run("git",["rev-parse",baselineApps],host).trim(),baselineTalks:run("git",["rev-parse",baselineTalks]).trim(),
  environment:{hardware:run("sysctl",["-n","machdep.cpu.brand_string"]).trim(),os:run("sw_vers",[]).trim(),skia:JSON.parse(readFileSync(path.join(skia,"package.json"),"utf8")).version,webgpu:JSON.parse(readFileSync(path.join(webgpu,"package.json"),"utf8")).version},
  metric:"Native offscreen render submission through synchronized completion; setup and React/UI scheduling excluded",results},null,2));
console.log(path.join(output,"results.json"));
