import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";

export const electronFireShader = `
uniform float time;
uniform float fireWidth;
uniform float barHeight;

float hash(float2 p) {
  return fract(sin(dot(p,float2(127.1,311.7)))*43758.5453);
}
float noise(float2 p) {
  float2 i=floor(p), f=fract(p);
  float2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+float2(1,0)),u.x),
    mix(hash(i+float2(0,1)),hash(i+float2(1,1)),u.x),u.y);
}
float turbulence(float2 p) {
  float n=0.0, amplitude=0.5;
  for(int i=0;i<4;i++) {
    n+=amplitude*noise(p);
    p=p*2.03+float2(19.1,7.7);
    amplitude*=0.5;
  }
  return n;
}
half4 main(float2 p) {
  float ignition=smoothstep(0.0,0.55,time);
  if(ignition<=0.0) return half4(0);
  float x=p.x-56.0, h=190.0-p.y;
  float edge=smoothstep(-18.0,12.0,x)*(1.0-smoothstep(fireWidth-12.0,fireWidth+18.0,x));
  float drift=sin(time*1.4+h*0.022)*12.0;
  float2 flow=float2((x+drift)*0.026,h*0.026-time*1.9);
  float warp=(turbulence(flow*0.53)-0.47)*42.0*clamp(h/100.0,0.0,1.0);
  float billow=turbulence(flow+float2(warp*0.025,0));
  float height=75.0+100.0*turbulence(float2(x*0.022,time*0.75));
  float detail=noise(flow*3.1+float2(0,-time*1.3));
  float tongue=0.82-h/height+(billow-0.46)*0.92+(detail-0.5)*0.09;
  float body=smoothstep(0.02,0.15,tongue)*edge*smoothstep(-35.0,-13.0,h);
  float heat=clamp(tongue*1.08+(detail-0.5)*0.13,0.0,1.0);
  float3 flame=mix(float3(0.85,0.055,0.005),float3(1.0,0.40,0.025),smoothstep(0.05,0.5,heat));
  flame=mix(flame,float3(1.0,0.86,0.27),smoothstep(0.38,0.8,heat));
  flame=mix(flame,float3(1.0,0.98,0.80),smoothstep(0.88,1.0,heat));
  float glow=exp(-abs(h-8.0)*0.025)*edge*(0.7+0.3*billow)*0.32;
  float3 color=float3(1.0,0.16,0.015)*glow;
  float alpha=glow;
  color=flame*body+color*(1.0-body);
  alpha=body+alpha*(1.0-body);

  // Neighboring emission lanes bound the particle work per fragment.
  float lane=floor(x/42.0);
  for(int neighbor=-1;neighbor<=1;neighbor++) for(int layer=0;layer<3;layer++) {
    float id=lane+float(neighbor);
    float seed=hash(float2(id,float(layer)+31.0));
    float cycle=time*(0.48+seed*0.48)+seed*11.0;
    float age=fract(cycle);
    float origin=(id+0.15+seed*0.7)*42.0;
    if(origin<0.0 || origin>fireWidth) continue;
    float lift=age*(125.0+seed*60.0);
    float sway=sin(age*5.0+seed*19.0)*14.0+age*18.0;
    float2 delta=float2(x-origin-sway,h-lift);
    float radius=0.8+seed*1.0;
    float spark=exp(-dot(delta/float2(radius,radius*2.1),delta/float2(radius,radius*2.1))*1.5);
    float halo=exp(-dot(delta,delta)*0.07)*0.18;
    float life=smoothstep(0.02,0.13,age)*(1.0-smoothstep(0.65,1.0,age));
    float ember=(spark+halo)*life;
    color+=float3(1.0,0.46+seed*0.32,0.08)*ember;
    alpha+=ember;
  }
  float melting=smoothstep(0.8,1.7,time);
  float fall=p.y-(184.0+barHeight);
  float lip=exp(-fall*fall*0.35)*edge*melting*0.65;
  color+=float3(1.0,0.38,0.025)*lip;
  alpha+=lip;
  float dripLane=floor(x/92.0);
  for(int neighbor=-1;neighbor<=1;neighbor++) {
    float id=dripLane+float(neighbor);
    float seed=hash(float2(id,83.0));
    float cycle=max(time-0.9,0.0)*(0.28+seed*0.18)+seed*0.83;
    float age=fract(cycle);
    float variation=hash(float2(id,floor(cycle)+57.0));
    float origin=(id+0.25+seed*0.5)*92.0;
    if(origin<8.0 || origin>fireWidth-8.0) continue;
    float growth=smoothstep(0.0,0.58,age);
    float extension=8.0+(24.0+variation*20.0)*growth;
    float detached=max((age-0.58)/0.42,0.0);
    float tip=extension+130.0*detached*detached;
    float dx=x-origin-sin(fall*0.035+seed*9.0)*2.5-detached*detached*(variation-0.5)*16.0;
    float neckLength=extension*(1.0-smoothstep(0.56,0.63,age));
    float neck=(1.0-smoothstep(1.3,3.4,abs(dx)))*smoothstep(-1.0,2.0,fall)
      *(1.0-smoothstep(neckLength-2.0,neckLength+2.0,fall));
    float radius=3.5+seed*2.0+growth*1.8;
    float2 drop=float2(dx,fall-tip)/float2(radius,radius*1.35);
    float distance=length(drop);
    float bead=1.0-smoothstep(0.72,1.1,distance);
    float life=melting*(1.0-smoothstep(0.91,1.0,age));
    float liquid=max(neck,bead)*life;
    float hot=exp(-dot(drop+float2(0.22,0.28),drop+float2(0.22,0.28))*3.0);
    float3 lava=mix(float3(1.0,0.12,0.005),float3(1.0,0.88,0.38),max(hot,neck*0.55));
    float halo=exp(-distance*distance*0.45)*life*0.24;
    color=lava*liquid+color*(1.0-liquid)+float3(1.0,0.13,0.005)*halo;
    alpha=liquid+alpha*(1.0-liquid)+halo;
  }
  float bounds=smoothstep(0.0,14.0,p.y)*(1.0-smoothstep(377.0,400.0,p.y));
  alpha=clamp(alpha,0.0,1.0)*ignition*bounds;
  return half4(min(color*ignition*bounds,float3(alpha)),alpha);
}`;

const effect = Skia.RuntimeEffect.Make(electronFireShader);
if (!effect) throw new Error("Could not compile Electron fire");

export function ElectronFire({ width, barHeight, x, y }: { width: number; barHeight: number; x: number; y: number }) {
  const uniforms = useAnimatedShaderUniforms({ fireWidth: width, barHeight }, 2.4, { clock: "step" });
  return <Canvas pointerEvents="none" accessibilityLabel="Flames, rising embers, and molten drips around the Electron download bar"
    style={{ position: "absolute", left: x - 56, top: y - 184, width: width + 112, height: 400 }}>
    <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
  </Canvas>;
}
