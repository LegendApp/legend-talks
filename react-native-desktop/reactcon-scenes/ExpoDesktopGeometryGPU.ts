import { gpuProgram, gpuQuad } from "slides:materials/GPU";

export function expoDesktopGeometry(desktop: boolean) {
  const pipes = desktop ? 2 : 3, ribbonCount = pipes * 96, lightCount = pipes * 16;
  return { particleCount: ribbonCount + lightCount + (desktop ? 72 + 20 : 0), code: gpuProgram(`${gpuQuad}
const desktop=${desktop ? '1.0' : '0.0'};
const resolution=vec2f(1824,1080);
const ribbonCount=${ribbonCount}u;
const lightCount=${lightCount}u;
fn connection()->f32 {return select(0.0,1.0,clock.step>=1.0);}
fn latch()->f32 {return connection()*smoothstep(0.95,1.4,clock.stepTime);}
fn pathX(t:f32,i:f32)->f32 {
 let start=912.0+(i-2.0)*70.0; let end=160.0+i*376.0;
 if(i>=3.0) {
  let bridge=1288.0+(i-3.0)*376.0;let upper=clamp(t/0.50625,0.0,1.0);let lower=clamp((t-0.50625)/0.49375,0.0,1.0);
  let x=select(mix(bridge,end,lower*lower*(3.0-2.0*lower)),mix(start,bridge,upper*upper*(3.0-2.0*upper)),t<0.50625);
  let bend=pow(4.0*t*(1.0-t),2.0);let impact=max(clock.stepTime-0.85,0.0);
  let recoil=connection()*sin(impact*19.0)*exp(-impact*3.7);
  return x+bend*((i-3.5)*100.0*(1.0-latch())+recoil*62.0);
 }
 return mix(start,end,t*t*(3.0-2.0*t));
}
fn path(t:f32,i:f32)->vec2f {return vec2f(pathX(t,i),188.0+t*320.0);}
fn normal(t:f32,i:f32)->vec2f {
 let slope=(pathX(min(1.0,t+0.001),i)-pathX(max(0.0,t-0.001),i))/0.640;
 return normalize(vec2f(1,-slope));
}
fn fade(t:f32,i:f32)->f32 {
 let gap=desktop*(1.0-latch());let reveal=1.0-gap*(smoothstep(0.33,0.35,t)*(1.0-smoothstep(0.64,0.66,t)));
 let growth=smoothstep(0.12+i*0.045,1.5+i*0.045,clock.slideTime);
 return smoothstep(185.0,193.0,188.0+t*320.0)*(1.0-smoothstep(499.0,511.0,188.0+t*320.0))*reveal*(1.0-smoothstep(growth-0.02,growth+0.02,t));
}
fn branchRibbon(d:f32,t:f32,phase:f32,tint:vec3f,light:vec3f)->vec3f {
 let pulse=0.5+0.5*sin(clock.slideTime*1.4-t*6.0+phase);
 let radius=mix(14.0,3.0,t)*(0.9+pulse*0.2);let n=d/radius;
 let body=1.0-smoothstep(0.8,1.12,abs(n));let edge=exp(-abs(abs(d)-radius*0.87)*0.9);
 let ridge=exp(-pow((n+0.3)*4.0,2.0));let flow=pow(0.5+0.5*sin(t*22.0-clock.slideTime*3.0+phase),8.0);
 return tint*(body*0.35+ridge*body*0.55+exp(-abs(d)/(radius*2.0))*0.08)+light*(edge*0.6+flow*body*0.35);
}
@fragment fn fragmentMain(in:Surface)->@location(0) vec4f {return vec4f(0);}
struct Geometry { @builtin(position) position:vec4f, @location(0) local:vec2f,
 @location(1) @interpolate(flat) identity:vec4f, @location(2) @interpolate(flat) appearance:vec4f }
@vertex fn particleVertex(@builtin(vertex_index) vertex:u32,@builtin(instance_index) instance:u32)->Geometry {
 let c=corner(vertex);let impact=max(clock.stepTime-0.85,0.0);let hit=connection()*step(0.85,clock.stepTime);
 var position=vec2f(0);var local=vec2f(0);var identity=vec4f(0);var appearance=vec4f(0);
 if(instance<ribbonCount) {
  let index=instance/96u; let i=f32(index)+${desktop ? '3.0' : '0.0'};
  let segment=instance%96u;let t=(f32(segment)+(c.y+1.0)*0.5)/96.0;
  let extent=100.0;position=path(t,i)+normal(t,i)*c.x*extent;
  local=vec2f(c.x*extent,t);identity=vec4f(0,i,0,0);
 } else if(instance<ribbonCount+lightCount) {
  let index=instance-ribbonCount;let i=f32(index/16u)+${desktop ? '3.0' : '0.0'};let j=f32(index%16u);
  let time=clock.slideTime;let travel=fract(j/16.0+(min(time,3.0)+max(0.0,time-3.0)*0.25)*0.18+i*0.071);
  let seed=fract(sin(j*127.1+i*71.7+19.3)*43758.5453);let brightness=fract(sin(j*53.9+i*143.3+7.1)*17341.17);
  let size=mix(1.6,5.7,seed);position=path(travel,i)+normal(travel,i)*(seed-0.5)*19.0+c*size*16.0;
  local=c*size*16.0;identity=vec4f(1,i,travel,size);
  let flowing=select((1.0-step(0.35,travel))+step(0.35,travel)*connection()*smoothstep(1.5,2.6,clock.stepTime),1.0,desktop<0.5);
  appearance=vec4f(mix(0.38,1.45,brightness)*(0.88+0.12*sin(time*2.0+j)),flowing,0,0);
 } else if(instance<ribbonCount+lightCount+72u) {
  let index=instance-ribbonCount-lightCount;let i=f32(index/36u)+3.0;let end=(index%36u)/18u;let j=f32(index%18u);
  let t=select(0.34,0.65,end==1u);let age=fract(clock.slideTime*1.25+j*0.618+i*0.37+f32(end)*0.23);
  let size=2.0+j%4.0;let broken=path(t,i);
  position=broken+vec2f(sin(j*17.3+i*4.0)*age*155.0,select(55.0,-125.0,end==1u)*age+age*age*145.0)+c*size*18.0;
  local=c*size*18.0;identity=vec4f(2,i,t,size);
  let reached=smoothstep(t,t+0.08,smoothstep(0.12+i*0.045,1.5+i*0.045,clock.slideTime));
  appearance=vec4f((1.0-age)*(1.0-latch())*reached,0,0,0);
 } else {
  let j=f32(instance-ribbonCount-lightCount-72u);let angle=j*2.39996;let speed=130.0+j*13.0;
  let size=vec2f(3.0+j%3.0,9.0);local=c*(size+12.0);
  position=vec2f(1476,350)+vec2f(cos(angle)*speed*impact,sin(angle)*speed*impact+250.0*impact*impact)+rotate(local,-angle-impact*5.0);
  identity=vec4f(3,0,size);appearance=vec4f(hit*(1.0-smoothstep(1.1,2.2,impact))*0.75,0,0,0);
 }
 position-=desktop*hit*exp(-impact*7.0)*vec2f(sin(impact*91.0)*10.0,cos(impact*77.0)*6.0);
 position.y+=240.0;
 return Geometry(vec4f(position/resolution*vec2f(2,-2)+vec2f(-1,1),0,1),local,identity,appearance);
}
@fragment fn particleFragment(in:Geometry)->@location(0) vec4f {
 let kind=in.identity.x;let i=in.identity.y;let outage=desktop*(1.0-latch());
 let tint=mix(vec3f(0.08,0.58,1),vec3f(1,0.08,0.14),outage);let light=mix(vec3f(0.6,0.91,1),vec3f(1,0.65,0.65),outage);
 var rgb=vec3f(0);var alpha=0.0;
 if(kind==0.0) {
  let d=in.local.x;let t=in.local.y;var pipe=vec3f(0);
  for(var strand=0;strand<2;strand++) {
   let phase=i*0.7+f32(strand)*3.14159;let offset=sin(t*8.0+phase)*sin(t*3.14159)*13.0;
   pipe=max(pipe,branchRibbon(d-offset,t,phase,tint,light));
  }
  var power=select(mix(0.65,1.0,connection()*smoothstep(1.6,2.6,clock.stepTime)),1.0,desktop<0.5);
  if(desktop>0.5 && t<0.35){power=1.0;}
  let hit=connection()*step(0.85,clock.stepTime);
  let surge=desktop*hit*exp(-pow((t-mix(0.35,1.12,clamp((clock.stepTime-1.5)/1.15,0.0,1.0)))*18.0,2.0))*(1.0-smoothstep(2.6,3.0,clock.stepTime));
  pipe=pipe*power+vec3f(0.6,0.94,1)*surge*exp(-abs(d)*0.12)*1.8;
  let visibility=fade(t,i);alpha=clamp(max(pipe.r,max(pipe.g,pipe.b)),0.0,1.0)*visibility;rgb=min(pipe*visibility,vec3f(alpha));
 } else if(kind==1.0) {
  let distance=length(in.local);let size=in.identity.w;
  let spark=(exp(-distance*distance/(size*size))+exp(-distance/(size*2.6))*0.4)*in.appearance.x;
  alpha=clamp(spark,0.0,0.96)*fade(in.identity.z,i)*in.appearance.y;
  rgb=mix(vec3f(0.9,0.97,1),vec3f(1,0.35,0.25),outage)*alpha;
 } else if(kind==2.0) {
  let distance=length(in.local);let size=in.identity.w;
  alpha=clamp(exp(-distance/size)+0.3*exp(-distance/(size*3.0)),0.0,1.0)*in.appearance.x;rgb=vec3f(1,0.36,0.13)*alpha;
 } else {
  alpha=exp(-max(roundedBox(in.local,in.identity.zw,1.0),0.0)*0.7)*in.appearance.x;rgb=vec3f(0.47,0.86,1)*alpha;
 }
 return vec4f(rgb,alpha);
}
`) };
}
