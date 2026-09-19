import { d, tgpu } from "typegpu";

// TypeGPU owns the shared CPU/GPU layout and composes reusable shader functions.
// The host sends this resolved program to a UI-thread WebGPU renderer once.
const Frame = d.struct({ time: d.f32, dt: d.f32, frame: d.f32, step: d.f32, aspect: d.f32, brightness: d.f32, padding: d.vec2f }).$name("Frame");
const hash = tgpu.fn([d.f32], d.f32)(`(n: f32) -> f32 {
  return fract(sin(n * 127.1 + 31.7) * 43758.5453);
}`).$name("hash");
const common = `
@group(0) @binding(0) var<uniform> clock: Frame;
@group(0) @binding(1) var<storage, read> previous: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> next: array<vec4f>;
const PI: f32 = 3.14159265;
fn box(p: vec2f, b: vec2f, r: f32) -> f32 {
  let q = abs(p)-b+r;
  return length(max(q,vec2f(0)))+min(max(q.x,q.y),0.0)-r;
}
fn line(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let v=b-a; return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0));
}
fn glass(distance: f32, p: vec2f, tint: vec3f) -> vec3f {
  let inside=1.0-smoothstep(-0.002,0.002,distance);
  let rim=exp(-abs(distance)*250.0);
  let sheen=0.65+0.35*cos(p.y*12.0+p.x*2.0);
  return tint*inside*sheen+vec3f(0.52,0.85,1.0)*rim*0.65;
}
fn rootPosition(phase: f32, id: f32) -> vec2f {
  let branch=f32(u32(id)%5u);
  let endpoint=0.12+branch*0.19;
  let t=clamp((phase-0.43)/0.57,0.0,1.0);
  let root=0.5+(f32(u32(id)%10u)/9.0-0.5)*pow(max(0.0,1.0-phase/0.43),2.0)*0.95;
  let x=select(root,mix(0.5,endpoint,t*t),phase>0.43);
  return vec2f(x,0.94-phase*0.85);
}
@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let i=gid.x; if(i>=COUNT) { return; }
  let id=f32(i); let seed=hash(id);
  if (MODE == 4u) {
    if(i>=16u) { next[i]=vec4f(0); return; }
    var state=previous[i];
    if(clock.frame<0.5) {
      state=vec4f(0.08+hash(id*2.0)*0.84,0.1+hash(id*2.0+1.0)*0.8,
        (seed-0.5)*0.065,(hash(id+67.0)-0.5)*0.065);
    } else {
      var force=vec2f(0);
      for(var j=0u;j<16u;j++) {
        if(j==i) { continue; }
        let delta=state.xy-previous[j].xy;
        let dist=max(length(delta),0.01);
        force+=delta/dist*max(0.0,0.17-dist)*0.075;
      }
      state=vec4f(state.xy,clamp(state.zw+force*clock.dt,vec2f(-0.08),vec2f(0.08)));
      state=vec4f(state.xy+state.zw*clock.dt,state.zw);
      if(state.x<0.04 || state.x>0.96) { state.z=-state.z; }
      if(state.y<0.06 || state.y>0.94) { state.w=-state.w; }
      state=vec4f(clamp(state.xy,vec2f(0.04,0.06),vec2f(0.96,0.94)),state.zw);
    }
    next[i]=state;
  } else if(MODE==0u) {
    var phase=fract(seed+clock.time*0.11);
    if(clock.frame>0.5) { phase=fract(previous[i].z+clock.dt*0.11); }
    next[i]=vec4f(rootPosition(phase,id),phase,seed);
  } else {
    let ring=floor(id/32.0);
    let angle=id*2.39996+clock.time*0.025*(1.0+ring*0.04);
    let radius=0.07+sqrt(id/256.0)*0.4;
    next[i]=vec4f(0.5+cos(angle)*radius,0.5+sin(angle)*radius,seed,0.0);
  }
}
struct VertexOutput { @builtin(position) position: vec4f, @location(0) uv: vec2f }
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  let uv=vec2f(f32((index<<1u)&2u),f32(index&2u));
  return VertexOutput(vec4f(uv*vec2f(2,-2)+vec2f(-1,1),0,1),uv);
}
@vertex fn particleVertex(@builtin(vertex_index) index: u32, @builtin(instance_index) id: u32) -> VertexOutput {
  let corners=array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(-1,1),vec2f(1,-1),vec2f(1,1));
  let corner=corners[index]; var pos=previous[id].xy;
  // Constellation is circular in pixel space; roots occupy the entire surface.
  if(MODE==3u) { pos=vec2f(0.5+(pos.x-0.5)*0.7,pos.y); }
  let radius=select(0.006,0.011,MODE==3u);
  return VertexOutput(vec4f((pos+corner*vec2f(radius/clock.aspect,radius))*vec2f(2,-2)+vec2f(-1,1),0,1),corner);
}
@fragment fn particleFragment(in: VertexOutput) -> @location(0) vec4f {
  let glow=exp(-dot(in.uv,in.uv)*4.0);
  return vec4f(vec3f(0.24,0.8,1.0)*glow,glow);
}
`;

const shades = [
  // Root sculpture plus a compute-updated stream of individual particles.
  `
  var c=vec3f(0);
  for(var i=0;i<10;i++) {
    let t=clamp((0.94-uv.y)/0.85,0.0,1.0);
    let center=rootPosition(t,f32(i));
    let width=0.0015+0.007*(1.0-abs(t-0.43));
    let distance=abs(uv.x-center.x)-width;
    c+=glass(distance,uv,vec3f(0.01,0.04,0.06))*0.23*smoothstep(0.07,0.11,uv.y)*(1.0-smoothstep(0.92,0.96,uv.y));
  }
  let foot=exp(-((uv.y-0.94)*60.0)*((uv.y-0.94)*60.0))*exp(-((uv.x-0.5)*2.0)*((uv.x-0.5)*2.0));
  c+=vec3f(0.04,0.18,0.25)*foot;
  return vec4f(c,clamp(max(c.r,max(c.g,c.b))*1.6,0.0,1.0));
  `,
  // Shallow perspective, distinct layers, and live assembling controls.
  `
  let col=min(2u,u32(uv.x*3.0));
  var p=vec2f(fract(uv.x*3.0)-0.5,(uv.y-0.5)*0.87);
  let tilt=0.07*sin(clock.time*0.5+f32(col)*0.8);
  p=vec2f(p.x+p.y*tilt,p.y-p.x*0.08);
  let frame=box(p,vec2f(0.43,0.29),0.028);
  var c=glass(frame,p,vec3f(0.015,0.045,0.075));
  c+=vec3f(0.12,0.25,0.34)*exp(-abs(p.y+0.22)*600.0)*step(abs(p.x),0.415);
  for(var i=0;i<3;i++) {
    c+=vec3f(0.35,0.63,0.79)*(1.0-smoothstep(0.007,0.01,length(p-vec2f(-0.36+f32(i)*0.028,-0.25))));
  }
  if(col==0u) {
    let lift=0.008+0.015*(0.5+0.5*sin(clock.time*1.4));
    let b=box(p-vec2f(-0.19,-0.065-lift),vec2f(0.105,0.04),0.02);
    c+=glass(b,p,vec3f(0.12,0.39,0.53));
    let on=smoothstep(-0.3,0.3,sin(clock.time));
    c+=glass(box(p-vec2f(0.18,-0.065),vec2f(0.1,0.04),0.04),p,vec3f(0.02,0.12,0.19));
    c+=glass(length(p-vec2f(0.12+on*0.12,-0.065))-0.033,p,vec3f(0.25,0.65,0.78));
    c+=vec3f(0.2,0.6,0.8)*exp(-line(p,vec2f(-0.28,0.15),vec2f(0.28,0.15))*400.0);
    c+=glass(length(p-vec2f(sin(clock.time*0.8)*0.23,0.15))-0.028,p,vec3f(0.17,0.5,0.65));
  } else if(col==1u) {
    c+=glass(box(p-vec2f(0,0.025),vec2f(0.35,0.19),0.02),p,vec3f(0.02,0.08,0.13));
    let scan=exp(-((p.y-0.16*sin(clock.time))*20.0)*((p.y-0.16*sin(clock.time))*20.0));
    for(var row=0;row<4;row++) {
      c+=vec3f(0.05,0.28,0.4)*scan*(1.0-smoothstep(0.002,0.004,
        box(p-vec2f(0,-0.08+f32(row)*0.066),vec2f(0.25-f32(row)*0.035,0.008),0.004)));
    }
  } else {
    let t=fract(clock.time*0.15);
    let circle=p-vec2f(-0.17,0.035);
    let angle=fract((atan2(circle.y,circle.x)+PI*0.5)/(2.0*PI)+1.0);
    c+=vec3f(0.2,0.7,1.0)*exp(-abs(length(circle)-0.105)*450.0)*step(angle,min(t*1.3,1.0));
    let rect=p-vec2f(0.16,0.035);
    let angle2=fract((atan2(rect.y,rect.x)+PI*0.5)/(2.0*PI)+1.0);
    c+=vec3f(0.2,0.7,1.0)*exp(-abs(box(rect,vec2f(0.105,0.105),0.025))*450.0)*step(angle2,min(t*1.3,1.0));
  }
  return vec4f(c,0.96);
  `,
  // One step: build exaggerated glass in the composer, then slowly engulf the slide.
  `
  let drama=smoothstep(0.0,5.0,clock.time);
  let grow=smoothstep(5.0,13.0,clock.time);
  let reveal=smoothstep(0.0,3.0,clock.time);
  let center=vec2f(0.5,mix(600.0/1080.0,0.5,grow));
  let p=(uv-center)*vec2f(clock.aspect,1);
  let radius=length(p);
  let wave=sin(radius*38.0-clock.time*4.0)*exp(-radius*0.75);
  let wave2=sin(p.x*11.0+p.y*8.0+clock.time*2.0);
  let normal=normalize(vec3f(p/max(radius,0.01)*cos(radius*38.0-clock.time*4.0)*(0.1+drama*1.1),1.0));
  let spec=pow(max(dot(normal,normalize(vec3f(-0.4,-0.6,1))),0.0),20.0);
  let size=mix(vec2f(1696.0/2160.0,0.1406),vec2f(1.7,0.85),grow);
  let border=box(p,size,0.045+grow*0.15)-wave*grow*0.025;
  let gridP=p+normal.xy*0.035*(0.3+drama);
  let grid=min(abs(fract(gridP.x*6.0)-0.5),abs(fract(gridP.y*6.0)-0.5));
  var c=glass(border,p,vec3f(0.03,0.1,0.16));
  c+=(vec3f(0.15,0.5,0.75)*spec*(0.2+drama*1.3)+vec3f(0.02,0.09,0.15)*exp(-grid*65.0)
    +vec3f(0.08,0.04,0.14)*(0.5+0.5*wave2)*drama)*(1.0-smoothstep(0.0,0.002,border));
  let alpha=clamp(1.0-smoothstep(0.0,0.003,border),0.0,1.0)*reveal;
  return vec4f(c*alpha,alpha);
  `,
  // Connections illuminate outward. Dots are individual instanced particles.
  `
  var c=vec3f(0);
  let progress=fract(clock.time*0.08);
  let p=vec2f((uv.x-0.5)/0.7+0.5,uv.y);
  for(var i=0u;i<64u;i++) {
    let a=previous[i*4u].xy;
    let b=previous[(i*4u+13u)%256u].xy;
    let distance=line(p,a,b);
    let lit=smoothstep(0.0,0.04,progress-length(a-vec2f(0.5)));
    c+=mix(vec3f(0.007,0.018,0.026),vec3f(0.04,0.19,0.27),lit)*exp(-distance*650.0);
  }
  let ring=abs(length((uv-vec2f(0.5))*vec2f(1.43,1))-progress);
  c+=vec3f(0.015,0.1,0.15)*exp(-ring*90.0);
  return vec4f(c,clamp(max(c.r,max(c.g,c.b))*2.0,0.0,0.8));
  `,
  // Persistent ping-pong simulation: droplets repel and bounce within bounds.
  `
  let p=uv*vec2f(clock.aspect,1);
  var field=0.0; var gradient=vec2f(0);
  for(var i=0u;i<16u;i++) {
    let delta=p-previous[i].xy*vec2f(clock.aspect,1);
    let rr=0.003+hash(f32(i)+99.0)*0.009;
    let denominator=dot(delta,delta)+0.002;
    field+=rr/denominator;
    gradient+=-2.0*rr*delta/(denominator*denominator);
  }
  let edge=abs(field-1.0);
  let normal=normalize(vec3f(gradient*0.035,1));
  let refracted=p+normal.xy*0.024;
  let grid=min(abs(fract(refracted.x*7.0)-0.5),abs(fract(refracted.y*7.0)-0.5));
  var c=vec3f(0.018,0.035,0.055)+vec3f(0.02,0.04,0.065)*exp(-grid*80.0);
  c+=vec3f(0.04,0.1,0.17)*smoothstep(0.9,1.15,field);
  c+=vec3f(0.4,0.7,0.95)*exp(-edge*17.0)*pow(max(dot(normal,normalize(vec3f(-0.5,-0.7,1))),0.0),4.0);
  return vec4f(c*clock.brightness,1);
  `,
];
function program(mode: number) {
  return tgpu.resolve({
    externals: { Frame, hash },
    template: `const MODE: u32 = ${mode}u; const COUNT: u32 = ${mode === 0 ? 2048 : 256}u;\n${common}
@fragment fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let uv=in.uv;
  ${shades[mode]}
}`,
  });
}
export const rootsProgram = program(0);
export const windowsProgram = program(1);
export const takeoverProgram = program(2);
export const ecosystemProgram = program(3);
export const dropletsProgram = program(4);
