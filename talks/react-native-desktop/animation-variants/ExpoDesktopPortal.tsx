import { GitHubLink } from "../GitHubLink";
import { Canvas, Fill, Path, Shader, Skia } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// The lens warps the particle field itself, so moving lights refract continuously
// without screen captures, extra render passes, or JS animation updates.
export const portalShader = `
uniform float time;
float hash(float2 p) { return fract(sin(dot(p,float2(127.1,311.7)))*43758.5453); }
float3 stream(float2 p,float t) {
  float3 light=float3(0);
  float envelope=smoothstep(248.0,270.0,p.x)*(1.0-smoothstep(1390.0,1610.0,p.x));
  if(envelope<=0.0 || abs(p.y-330.0)>430.0) return light;
  for(int lane=0;lane<19;lane++) {
    float l=float(lane);
    float speed=65.0+hash(float2(l,9))*95.0;
    float cell=floor((p.x-t*speed)/44.0);
    for(int neighbor=-1;neighbor<=1;neighbor++) {
      float id=cell+float(neighbor);
      float seed=hash(float2(id,l));
      float x=(id+seed)*44.0+t*speed;
      // The Expo mark is centered at x=248. Fan out from a narrow emitter
      // inside it, reaching the full particle spread at the portal.
      float spread=mix(0.025,1.0,smoothstep(248.0,800.0,x));
      float py=330.0+spread*((l-9.0)*10.0+sin(x*0.006-l*0.29+t*0.15)*(24.0+l*2.8));
      float d=length(p-float2(x,py));
      float size=0.45+pow(hash(float2(id+31.0,l)),4.0)*4.8;
      float glow=exp(-d/size)+exp(-d/(size*4.0))*0.14;
      light+=float3(0.35,0.76,1.0)*glow*(0.18+pow(hash(float2(id,l+41.0)),2.0)*2.8);
    }
  }
  return light*envelope;
}
half4 main(float2 p) {
  float2 center=float2(820,325);
  float2 q=p-center;
  q.x-=q.y*0.11;
  float2 uv=q/float2(105,265);
  float radius=length(uv);
  float inside=1.0-smoothstep(0.94,1.0,radius);
  float lens=sqrt(max(0.0,1.0-radius*radius));
  // Strong curved refraction plus a traveling ripple through the glass volume.
  float2 bent=p;
  bent.x+=inside*(uv.x*100.0*lens+sin(uv.y*13.0-time*1.6)*17.0*lens);
  bent.y+=inside*(uv.y*66.0*lens+sin(uv.x*9.0+time)*12.0*lens);
  float3 light=stream(bent,time);
  float arrival=smoothstep(1.5,2.5,time);
  float assemble=exp(-pow((time-3.0)/0.8,2.0));
  for(int target=0;target<2;target++) {
    float2 center=float2(target==0?1260.0:1440.0,330.0);
    float ring=abs(length(p-center)-(110.0*(1.0-arrival)+35.0));
    light+=float3(0.35,0.85,1)*exp(-ring*0.3)*assemble;
  }
  // A rounded glass cross-section: dark transmission, broad reflected light,
  // sharp grazing highlights, and a displaced rear surface give the rim depth.
  float angle=atan(uv.y,uv.x);
  float wobble=sin(angle*3.0-time*0.45)*0.003;
  float signedRim=(radius-0.975+wobble)*105.0;
  float tube=1.0-smoothstep(6.0,8.0,abs(signedRim));
  float normal=clamp(signedRim/7.0,-1.0,1.0);
  float face=sqrt(max(0.0,1.0-normal*normal));
  float reflection=pow(max(0.0,cos(angle+0.8)*0.55+normal*0.65),6.0);
  float highlight=exp(-pow((normal+0.42)/0.19,2.0));
  float shimmer=0.75+0.25*sin(angle*4.0-time*0.65);
  light*=1.0-tube*0.55;
  light+=tube*(float3(0.09,0.22,0.35)*face
    +float3(0.68,0.85,1.0)*highlight*shimmer*0.85
    +float3(0.85,0.94,1.0)*reflection*1.8);
  float frontEdge=abs(signedRim-6.7);
  float backEdge=abs(length((q-float2(6,-2))/float2(105,265))-1.0)*105.0;
  light+=float3(0.38,0.72,1.0)*(exp(-frontEdge/0.8)*1.05+exp(-frontEdge/11.0)*0.12);
  light+=float3(0.52,0.68,0.9)*exp(-backEdge/0.75)*0.55;
  light+=float3(0.035,0.12,0.21)*inside*(0.3+lens*0.7);
  // Drifting fine inclusions add depth inside the portal without a particle loop.
  float2 field=bent+float2(time*13.0,-time*23.0);
  float2 cell=floor(field/14.0);
  float2 local=fract(field/14.0)*14.0;
  float seed=hash(cell);
  float dust=exp(-length(local-float2(seed,hash(cell+7.0))*14.0)/(0.35+seed*0.55));
  light+=float3(0.35,0.7,1)*dust*inside*(0.4+seed);
  float floorGlow=exp(-length((p-float2(850,605))/float2(120,12)));
  light+=float3(0.1,0.5,1)*floorGlow*0.6;
  float alpha=clamp(max(light.r,max(light.g,light.b)),0.0,1.0);
  return half4(min(light,float3(alpha)),alpha);
}`;
const effect = Skia.RuntimeEffect.Make(portalShader);
if (!effect) throw new Error("Could not compile Expo Desktop portal");
const expoLogo = "M0 20.084c.043.53.23 1.063.718 1.778.58.849 1.576 1.315 2.303.567.49-.505 5.794-9.776 8.35-13.29a.761.761 0 011.248 0c2.556 3.514 7.86 12.785 8.35 13.29.727.748 1.723.282 2.303-.567.57-.835.728-1.42.728-2.046 0-.426-8.26-15.798-9.092-17.078-.8-1.23-1.044-1.498-2.397-1.542h-1.032c-1.353.044-1.597.311-2.398 1.542C8.267 3.991.33 18.758 0 19.77Z";


export function ExpoDesktopPortal() {
  const uniforms = useAnimatedShaderUniforms({}, 3.5);
  return <View style={{ width: 1696, height: 900, alignSelf: "center" }}>
    <Text style={{ color: "white", fontSize: 88, fontWeight: "600", textAlign: "center", marginTop: 12 }}>Expo Desktop</Text>
    <Canvas accessibilityLabel="A glowing glass portal refracts particles flowing from Expo to macOS and Windows" style={{ position: "absolute", top: 105, left: 0, width: 1696, height: 650 }}>
      <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
      <Path path={expoLogo} color="white" transform={[{ translateX: 182 }, { translateY: 272 }, { scale: 5.5 }]} />
      <Path path="M0 0H40V40H0ZM48 0H88V40H48ZM0 48H40V88H0ZM48 48H88V88H48Z" color="white" transform={[{ translateX: 1390 }, { translateY: 285 }, { scale: 1.2 }]} />
    </Canvas>
    <Text style={{ position: "absolute", left: 1190, top: 344, fontSize: 143, color: "white", fontFamily: "Helvetica Neue" }}></Text>
    <GitHubLink repository="shirakaba/expo-desktop" label="Expo Desktop on GitHub" style={{ position: "absolute", top: 772 }} />
  </View>;
}
