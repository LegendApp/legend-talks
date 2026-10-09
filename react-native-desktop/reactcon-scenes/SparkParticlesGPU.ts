import { gpuNumber, gpuProgram, gpuQuad } from "slides:materials/GPU";

export const sparkDataFields = ["time", "slideTime", "stepTime", "stepIndex", "kind", "padding", "unused", "unused"] as const;
const field = `
@group(0) @binding(5) var<storage,read> data:array<vec4f>;
const resolution=vec2f(2016,1000);
struct Particle { @builtin(position) position:vec4f, @location(0) local:vec2f,
 @location(1) @interpolate(flat) shape:vec4f, @location(2) @interpolate(flat) power:f32 }
@group(1) @binding(0) var fieldSampler:sampler;
@group(1) @binding(1) var fieldTexture:texture_2d<f32>;
@fragment fn compositeFragment(in:Surface)->@location(0) vec4f {
  let rgb=min(textureSampleLevel(fieldTexture,fieldSampler,in.uv,0.0).rgb,vec3f(1));
  return vec4f(rgb,max(rgb.r,max(rgb.g,rgb.b)));
}
fn screen(p:vec2f)->vec4f { return vec4f((p+data[1].y)/resolution*vec2f(2,-2)+vec2f(-1,1),0,1); }
`;

export function createSparkCursorProgram(cell:number, commandLength:number) {
  return gpuProgram(`${gpuQuad}${field}
@fragment fn fragmentMain(in:Surface)->@location(0) vec4f {
  if(data[0].w<5.0) { return vec4f(0); }
  let p=in.uv*resolution-data[1].y; let time=data[0].x; let hub=vec2f(848,330);
  let morph=smoothstep(2.0,3.0,time); let charge=smoothstep(0.65,1.15,time);
  let typed=clamp(floor((time-3.6)*17.0),0.0,${gpuNumber(commandLength)});
  let cursor=hub+vec2f(typed*${gpuNumber(cell)}*0.5,0);
  let d=mix(length(p-cursor)-25.0,roundedBox(p-cursor,vec2f(2.5,35),1.5),morph);
  let glow=exp(-abs(d)*(0.10+morph*0.15))*charge; let core=(1.0-smoothstep(-1.0,1.0,d))*charge;
  let burst=max(0.0,time-1.12); let flash=exp(-pow((time-1.3)*6.0,2.0));
  let shock=exp(-pow((length(p-hub)-burst*750.0)/24.0,2.0));
  let rgb=vec3f(0.55,0.9,1)*(glow*0.7+core)+vec3f(0.55,0.88,1)*exp(-length(p-hub)*0.006)*flash*5.0
    +vec3f(0.24,0.75,1)*shock*exp(-burst*1.1)*charge*(1.0-morph);
  return vec4f(rgb,0);
}
@vertex fn particleVertex(@builtin(vertex_index) vertex:u32,@builtin(instance_index) id:u32)->Particle {
  let c=corner(vertex); let i=f32(id); let time=data[0].x;
  let morph=smoothstep(2.0,3.0,time); let charge=smoothstep(0.65,1.15,time);
  let angle=i*2.39996; let burst=max(0.0,time-1.12);
  let radius=(1.0-exp(-burst*3.0))*(180.0+(i*17.0)%67.0*9.0);
  // The cursor does not start typing until after this particle morph ends.
  let hub=vec2f(848,330); let point=mix(hub+vec2f(cos(angle),sin(angle))*radius,hub,morph);
  let tail=mix(hub,point,0.86); let axis=point-tail; let span=max(length(axis),0.001);
  let along=select(vec2f(1,0),axis/span,span>0.001); let across=vec2f(-along.y,along.x); let size=2.0+i%4.0;
  let local=vec2f(mix(-size*16.0,span+size*16.0,(c.x+1.0)*0.5),c.y*size*16.0);
  var position=tail+along*local.x+across*local.y;
  if(data[0].w<5.0 || morph>=1.0 || charge<=0.0) { position=vec2f(-100000); }
  return Particle(screen(position),local,vec4f(0,size,span,0),(1.0-morph)*charge);
}
@fragment fn particleFragment(in:Particle)->@location(0) vec4f {
  let p=in.local; let size=in.shape.y; let span=in.shape.z;
  let spark=exp(-distance(p,vec2f(span,0))/size);
  let trail=exp(-length(p-vec2f(clamp(p.x,0.0,span),0))/1.8);
  return vec4f(vec3f(0.38,0.8,1)*(spark*2.4+trail*0.45)*in.power,0);
}
`);
}
export const sparkCursorProgram=createSparkCursorProgram(36,27);
