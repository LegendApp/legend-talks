import { d, tgpu } from "typegpu";
const Frame = d.struct({ time:d.f32, dt:d.f32, frame:d.f32, step:d.f32, aspect:d.f32, brightness:d.f32, slideTime:d.f32, stepTime:d.f32 }).$name("Frame");
export const portalParticles=19*41;
export const portalProgram=tgpu.resolve({ externals:{Frame}, template:`
@group(0) @binding(0) var<uniform> clock: Frame;
@group(1) @binding(0) var fieldSampler: sampler;
@group(1) @binding(1) var fieldTexture: texture_2d<f32>;
const resolution=vec2f(1696,650);
fn hash(p:vec2f)->f32 {return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
struct Surface { @builtin(position) position:vec4f,@location(0) uv:vec2f }
@vertex fn vertexMain(@builtin(vertex_index) i:u32)->Surface {
 let uv=vec2f(f32((i<<1u)&2u),f32(i&2u));return Surface(vec4f(uv*vec2f(2,-2)+vec2f(-1,1),0,1),uv);
}
@fragment fn fragmentMain(in:Surface)->@location(0) vec4f {return vec4f(0);}
struct Particle { @builtin(position) position:vec4f,@location(0) delta:vec2f,@location(1) @interpolate(flat) identity:vec2f,@location(2) x:f32 }
@vertex fn particleVertex(@builtin(vertex_index) vertex:u32,@builtin(instance_index) instance:u32)->Particle {
 let lane=f32(instance/41u);let speed=65.0+hash(vec2f(lane,9))*95.0;
 let first=floor(-clock.time*speed/44.0)-1.0;let id=first+f32(instance%41u);
 let seed=hash(vec2f(id,lane));let x=(id+seed)*44.0+clock.time*speed;
 let spread=mix(0.025,1.0,smoothstep(248.0,800.0,x));
 let y=330.0+spread*((lane-9.0)*10.0+sin(x*0.006-lane*0.29+clock.time*0.15)*(24.0+lane*2.8));
 let size=0.45+pow(hash(vec2f(id+31.0,lane)),4.0)*4.8;
 let corners=array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(-1,1),vec2f(1,-1),vec2f(1,1));
 let delta=corners[vertex]*size*24.0;let screen=vec2f(x,y)+delta;
 return Particle(vec4f(screen/resolution*vec2f(2,-2)+vec2f(-1,1),0,1),delta,vec2f(id,lane),screen.x);
}
@fragment fn particleFragment(in:Particle)->@location(0) vec4f {
 let id=in.identity.x;let lane=in.identity.y;
 let speed=65.0+hash(vec2f(lane,9))*95.0;
 let cell=floor((in.x-clock.time*speed)/44.0);
 if(abs(id-cell)>1.0){return vec4f(0);}
 let size=0.45+pow(hash(vec2f(id+31.0,lane)),4.0)*4.8;
 let distance=length(in.delta);let glow=exp(-distance/size)+exp(-distance/(size*4.0))*0.14;
 let envelope=smoothstep(248.0,270.0,in.x)*(1.0-smoothstep(1390.0,1610.0,in.x));
 let light=vec3f(0.35,0.76,1)*glow*(0.18+pow(hash(vec2f(id,lane+41)),2.0)*2.8)*envelope;
 return vec4f(light,0);
}
@fragment fn compositeFragment(in:Surface)->@location(0) vec4f {
 let p=in.uv*resolution;
  var center: vec2f=vec2f(820,325);
  var q: vec2f=p-center;
  q.x-=q.y*0.11;
  var uv: vec2f=q/vec2f(105,265);
  var radius: f32=length(uv);
  var inside: f32=1.0-smoothstep(0.94,1.0,radius);
  var lens: f32=sqrt(max(0.0,1.0-radius*radius));
  // Strong curved refraction plus a traveling ripple through the glass volume.
  var bent: vec2f=p;
  bent.x+=inside*(uv.x*100.0*lens+sin(uv.y*13.0-clock.time*1.6)*17.0*lens);
  bent.y+=inside*(uv.y*66.0*lens+sin(uv.x*9.0+clock.time)*12.0*lens);
  var light: vec3f=textureSampleLevel(fieldTexture,fieldSampler,bent/resolution,0.0).rgb;
  // A rounded glass cross-section: dark transmission, broad reflected light,
  // sharp grazing highlights, and a displaced rear surface give the rim depth.
  var angle: f32=atan2(uv.y,uv.x);
  var wobble: f32=sin(angle*3.0-clock.time*0.45)*0.003;
  var signedRim: f32=(radius-0.975+wobble)*105.0;
  var tube: f32=1.0-smoothstep(6.0,8.0,abs(signedRim));
  var normal: f32=clamp(signedRim/7.0,-1.0,1.0);
  var face: f32=sqrt(max(0.0,1.0-normal*normal));
  var reflection: f32=pow(max(0.0,cos(angle+0.8)*0.55+normal*0.65),6.0);
  var highlight: f32=exp(-pow((normal+0.42)/0.19,2.0));
  var shimmer: f32=0.75+0.25*sin(angle*4.0-clock.time*0.65);
  light*=1.0-tube*0.55;
  light+=tube*(vec3f(0.09,0.22,0.35)*face
    +vec3f(0.68,0.85,1.0)*highlight*shimmer*0.85
    +vec3f(0.85,0.94,1.0)*reflection*1.8);
  var frontEdge: f32=abs(signedRim-6.7);
  var backEdge: f32=abs(length((q-vec2f(6,-2))/vec2f(105,265))-1.0)*105.0;
  light+=vec3f(0.38,0.72,1.0)*(exp(-frontEdge/0.8)*1.05+exp(-frontEdge/11.0)*0.12);
  light+=vec3f(0.52,0.68,0.9)*exp(-backEdge/0.75)*0.55;
  light+=vec3f(0.035,0.12,0.21)*inside*(0.3+lens*0.7);
  // Drifting fine inclusions add depth inside the portal without a particle loop.
  var field: vec2f=bent+vec2f(clock.time*13.0,-clock.time*23.0);
  var cell: vec2f=floor(field/14.0);
  var local: vec2f=fract(field/14.0)*14.0;
  var seed: f32=hash(cell);
  var dust: f32=exp(-length(local-vec2f(seed,hash(cell+7.0))*14.0)/(0.35+seed*0.55));
  light+=vec3f(0.35,0.7,1)*dust*inside*(0.4+seed);
  var floorGlow: f32=exp(-length((p-vec2f(850,605))/vec2f(120,12)));
  light+=vec3f(0.1,0.5,1)*floorGlow*0.6;
  var alpha: f32=clamp(max(light.r,max(light.g,light.b)),0.0,1.0);
  return vec4f(min(light,vec3f(alpha)),alpha);
}
`});
