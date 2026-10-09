// Generate inputs for the browser's GPU timer benchmark without importing native UI.
import { readFileSync, writeFileSync } from "node:fs";
import { createImageShatterGPU } from "../../legend-apps/packages/slides-effects/packs/materials/ImageShatterGPU";
import { createFallingSpritesGPU } from "../../legend-apps/packages/slides-effects/packs/materials/FallingSpritesGPU";
import { portalProgram, portalParticles } from "../react-native-desktop/ExpoDesktopPortalGPU";
import { expoDesktopGeometry } from "../react-native-desktop/reactcon-scenes/ExpoDesktopGeometryGPU";
import { titleBubblesProgram } from "../react-native-desktop/TitleBubblesGPU";
const packs = "../legend-apps/packages/slides-effects/packs/";
function shader(file: string, name: string): string {
  const text = readFileSync(file,"utf8");
  const source = text.match(new RegExp(`(?:export )?const ${name} = \u0060([\\s\\S]*?)\u0060;`))?.[1];
  if (!source) throw new Error(`Missing ${name} in ${file}`);
  return source;
}
const shatter=shader(packs+"materials/ImageShatter.tsx","imageShatterShader");
const fire=shader(packs+"materials/Fire.tsx","spriteFireShader");
const portal=shader("react-native-desktop/ExpoDesktopPortal.tsx","portalShader");
const scene=shader("react-native-desktop/reactcon-scenes/ExpoDesktopScene.tsx","expoDesktopShader")
 .replace("${branchMaterialShader}",shader(packs+"materials/BranchMaterial.ts","branchMaterialShader"))
 .replace("${glassPanelMaterial}",shader(packs+"materials/GlassPanels.tsx","glassPanelMaterial"));
const fixtures = [
 {name:"shatter",width:1920,height:1180,code:createImageShatterGPU({imageWidth:1040,imageHeight:710.638,centerX:960,centerY:600},1920,1180,1),particleCount:40,image:"screenshot",over:true,baseline:shatter,times:[.35,.65,1],step:2,uniforms:{revealAtStep:1}},
 {name:"sprites",width:624,height:824,...createFallingSpritesGPU(368,30,800),image:"poop",over:true,baseline:fire,times:[3.1,5.4,16],step:1,uniforms:{fireWidth:368,barHeight:30,floorY:800,drops:1}},
 {name:"portal",width:1696,height:650,code:portalProgram,particleCount:portalParticles,composite:true,baseline:portal,times:[4,8,12],step:0,uniforms:{}},
 ...[false,true].map(desktop=>({name:desktop?"desktop-pipes":"mobile-pipes",width:1824,height:1080,...expoDesktopGeometry(desktop),over:true,baseline:scene,times:[.45,1.05,2.7],step:1,slideTime:7,uniforms:{desktop:desktop?1:0,gpuGeometry:0},residual:{gpuGeometry:1}})),
 {name:"title",width:1920,height:1080,code:titleBubblesProgram,particleCount:72,over:true,frameDataSize:580,times:[4],step:1,uniforms:{}},
];
const output=process.argv[2];
if(!output) throw new Error("Usage: bun --preload ./scripts/effectPacks.ts scripts/gpuMigrationFixtures.ts output.json");
writeFileSync(output,JSON.stringify(fixtures));
