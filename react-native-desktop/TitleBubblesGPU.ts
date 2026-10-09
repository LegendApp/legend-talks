import { gpuProgram, gpuQuad } from "slides:materials/GPU";

export const titleBubblesProgram = gpuProgram(`${gpuQuad}
@group(0) @binding(5) var<storage,read> data:array<vec4f>;
const resolution=vec2f(1920,1080);
fn backdrop(p:vec2f)->vec3f {
 let light=exp(-dot(p-vec2f(-0.5,-0.35),p-vec2f(-0.5,-0.35))*3.0);
 let glow=exp(-dot(p-vec2f(0.55,0.30),p-vec2f(0.55,0.30))*5.0);
 let cell=abs(fract(p/0.12+0.5)-0.5)*0.12;
 let grid=1.0-smoothstep(0.0,1.3/1080.0,min(cell.x,cell.y));
 return vec3f(0.006,0.009,0.014)+vec3f(0.036,0.049,0.067)*light+vec3f(0.020,0.033,0.045)*glow+vec3f(0.025,0.033,0.044)*grid;
}
fn shadeDroplet(p:vec2f,d:f32,normal:vec2f)->vec3f {
 let depth=max(-d,0.0);let inside=1.0-smoothstep(-1.0/1080.0,1.0/1080.0,d);
 let bend=0.065*(1.0-exp(-depth*180.0))*exp(-depth*22.0);
 let directional=pow(abs(dot(normal,normalize(vec2f(-0.6,-0.8)))),5.0);
 let rim=exp(-abs(d)*700.0);let shoulder=exp(-depth*65.0)*inside;
 let shadow=exp(-abs(d-0.008)*140.0)*(1.0-inside);
 var color=mix(backdrop(p),backdrop(p-normal*bend)*1.13+vec3f(0.004,0.006,0.009),inside);
 color*=1.0-shadow*0.30;
 color+=vec3f(0.68,0.77,0.88)*(rim*(0.035+directional*0.20)+shoulder*directional*0.065);
 return color;
}
@fragment fn fragmentMain(in:Surface)->@location(0) vec4f {return vec4f(0);}
struct Bubble { @builtin(position) position:vec4f,@location(0) local:vec2f,
 @location(1) @interpolate(flat) id:u32,@location(2) point:vec2f }
@vertex fn particleVertex(@builtin(vertex_index) vertex:u32,@builtin(instance_index) id:u32)->Bubble {
 let drop=data[id*2u];let local=corner(vertex)*(drop.z+2.0);
 var point=drop.xy+local;
 let detached=select(data[144].y>=2.0 && drop.w==4.0,data[144].y==1.0 && id<18u && drop.w>=1.0 && drop.w!=6.0,data[144].y<2.0);
 if(!detached || drop.z<0.1){point=vec2f(-100000);}
 return Bubble(vec4f(point/resolution*vec2f(2,-2)+vec2f(-1,1),0,1),local,id,point);
}
@fragment fn particleFragment(in:Bubble)->@location(0) vec4f {
 let drop=data[in.id*2u];let distance=length(in.local);
 if(data[144].y>=2.0) {
  let alpha=(1.0-smoothstep(-0.7,0.7,distance-drop.z))*(1.0-smoothstep(8.4,8.8,data[144].z*2.0));
  return vec4f(vec3f(0.97)*alpha,alpha);
 }
 let fill=1.0-smoothstep(drop.z-1.0,drop.z+1.0,distance);
 let normal=in.local/max(distance,0.001);
 let glass=shadeDroplet((in.point-vec2f(960,540))/1080.0,(distance-drop.z)/1080.0,normal)*data[144].x;
 let edge=exp(-abs(distance-drop.z)/2.8);let lit=max(0.0,dot(normal,normalize(vec2f(-0.6,-0.8))));
 let white=vec3f(0.93-edge*0.20+edge*lit*0.27);
 let blend=smoothstep(0.0,1.0,data[in.id*2u+1u].x);
 return vec4f(clamp(mix(glass,white,blend),vec3f(0),vec3f(1))*fill,fill);
}
`);
