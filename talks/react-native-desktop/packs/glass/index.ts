import { createRefractionShader } from "slides:materials/Refraction";
export { MaterialSampler } from "./MaterialSampler";

export const glassTimeline = { response: 0.5, moreRefraction: 8, peak: 24 } as const;

export const chatGlassUniforms = {
  surfaceA: [0.0143, 0.434, 0.2357, 0.538],
  surfaceB: [0.2786, 0.452, 0.9714, 0.835],
};

export const liquidGlass = createRefractionShader({ ramp: glassTimeline });
