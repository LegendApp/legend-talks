import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// Analytic glass pipes and devices. A shared UI-thread clock moves the light
// particles; no snapshots, texture uploads, or per-frame JS geometry updates.
export const expoDesktopShader = `
uniform float time;
uniform float desktop;
float roundedBox(float2 p, float2 size, float radius) {
  float2 q=abs(p)-size+radius;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
}
float4 over(float4 a,float4 b) { return a+b*(1.0-a.a); }
float4 material(float2 p,float2 size,float radius,float3 tint) {
  float d=roundedBox(p,size,radius);
  float mask=1.0-smoothstep(-0.8,0.8,d);
  float rim=exp(-abs(d+2.2)*0.58);
  float inner=exp(-abs(d+8.0)*0.19);
  float reflection=(p.x*0.30+p.y+size.y*0.62)/20.0;
  float highlight=exp(-reflection*reflection);
  float directional=0.5+0.5*cos(atan(p.y,p.x)*2.0-0.8);
  float3 color=tint*(0.8+highlight*0.65)
    +float3(0.58,0.82,1.0)*rim*(0.32+directional*0.68)
    +float3(0.13,0.33,0.50)*inner;
  return float4(color*mask,mask*0.94);
}
float pathX(float t,float i) {
  float start=848.0+(i-2.0)*35.0;
  float end=180.0+i*325.0;
  if(i>=3.0) {
    float bridge=1140.0+(i-3.0)*355.0;
    float upper=clamp(t/0.578,0.0,1.0);
    float lower=clamp((t-0.578)/0.422,0.0,1.0);
    return t<0.578 ? mix(start,bridge,upper*upper*(3.0-2.0*upper))
      : mix(bridge,end,lower*lower*(3.0-2.0*lower));
  }
  float ease=t*t*(3.0-2.0*t);
  return mix(start,end,ease);
}
float3 wallpaper(float2 p,float2 size,float seed) {
  float2 uv=p/size;
  float curve=0.34*sin(uv.x*2.0+seed)-uv.x*0.45;
  float band=uv.y-curve;
  float line=exp(-abs(band)*28.0);
  float fill=smoothstep(-0.03,0.10,band);
  float curve2=uv.y+sin(uv.x*2.2+seed+1.7)*0.48-0.45;
  float3 c=mix(float3(0.015,0.045,0.12),float3(0.10,0.29,0.61),fill);
  c+=float3(0.31,0.52,0.82)*line*0.6;
  c=mix(c,float3(0.01,0.045,0.16),smoothstep(-0.02,0.06,curve2)*0.85);
  c+=float3(0.18,0.38,0.66)*exp(-abs(curve2)*32.0)*0.55;
  return c;
}
half4 main(float2 p) {
  float4 outColor=float4(0);
  for(int k=0;k<5;k++) {
    float i=float(k);
    if ((desktop < 0.5 && k<3) || (desktop > 0.5 && k>=3)) {
      float endpoint=180.0+i*325.0;
      float3 tint=k<3 ? float3(0.24,0.43,0.70) : float3(0.04,0.67,0.90);
      // Broad, curved tubes, with a transparent core and two refractive rims.
      if(p.y>=123.0 && p.y<=475.0) {
        float t=clamp((p.y-124.0)/348.0,0.0,1.0);
        float slope=(pathX(min(1.0,t+0.001),i)-pathX(max(0.0,t-0.001),i))/0.696;
        float d=(p.x-pathX(t,i))/sqrt(1.0+slope*slope);
        float radius=15.0+desktop*3.0;
        float n=d/radius;
        float body=1.0-smoothstep(0.82,1.03,abs(n));
        float rim=exp(-abs(abs(d)-radius*0.86)*0.85);
        float ridgeAxis=(n+0.45)*5.0;
        float ridge=exp(-ridgeAxis*ridgeAxis)*body;
        float glow=exp(-abs(d)*0.085)*0.15;
        float fade=smoothstep(123.0,131.0,p.y)*(1.0-smoothstep(463.0,475.0,p.y));
        float3 pipe=tint*(body*0.32+ridge*0.55+glow)+float3(0.63,0.87,1.0)*rim*0.80;
        float alpha=clamp(body*0.5+rim*0.65+glow,0.0,0.96)*fade;
        outColor=over(float4(min(pipe*fade,float3(alpha)),alpha),outColor);
        // Particles follow the same centerline from project to device.
        for(int j=0;j<9;j++) {
          float travel=fract(float(j)/9.0+time*0.18+i*0.071);
          float2 dotPosition=float2(pathX(travel,i),124.0+travel*348.0);
          float distance=length(p-dotPosition);
          float intensity=0.70+0.30*sin(time*2.0+float(j));
          float spark=(exp(-distance*distance/10.0)+exp(-distance*0.20)*0.32)*intensity;
          float alpha=clamp(spark,0.0,0.96)*fade;
          outColor=over(float4(float3(0.72,0.92,1.0)*alpha,alpha),outColor);
        }
      }
      // Devices share a bottom baseline, as in the selected concept.
      bool phone=k<2;
      float2 size=phone ? float2(57.0,103.0) : float2(130.0,86.0);
      float2 center=float2(endpoint,phone ? 527.0 : 544.0);
      float2 local=p-center;
      float radius=phone ? 17.0 : 9.0;
      float4 frame=material(local,size,radius,float3(0.015,0.045,0.085));
      float2 screenSize=size-float2(6.0,7.0);
      float screen=1.0-smoothstep(-0.8,0.8,roundedBox(local,screenSize,radius-4.0));
      float3 screenColor=wallpaper(local,screenSize,i*0.6);
      if(phone) {
        float notch=k==0 ? roundedBox(local-float2(0,-94),float2(20,4),4.0) : length(local-float2(0,-93))-3.5;
        screenColor=mix(screenColor,float3(0.004,0.008,0.018),1.0-smoothstep(-0.5,0.5,notch));
      } else if(k==2) {
        float toolbar=1.0-smoothstep(-65.0,-63.0,local.y);
        screenColor=mix(screenColor,float3(0.06,0.13,0.23),toolbar);
        for(int dot=0;dot<3;dot++) {
          float circle=length(local-float2(-110.0+float(dot)*13.0,-74.0));
          screenColor+=float3(0.6,0.78,0.94)*(1.0-smoothstep(3.0,4.0,circle));
        }
        float2 globe=local-float2(0,8);
        float globeLines=exp(-abs(length(globe)-30.0)*1.3);
        globeLines=max(globeLines,exp(-abs(length(globe/float2(0.47,1.0))-30.0)*0.9));
        globeLines=max(globeLines,exp(-abs(globe.y)*1.1)*step(abs(globe.x),30.0));
        globeLines=max(globeLines,exp(-abs(abs(globe.y)-16.0)*1.1)*step(abs(globe.x),25.0));
        screenColor+=float3(0.37,0.65,0.94)*globeLines;
      } else if(k==4) {
        float2 logo=local-float2(0,-9);
        float panes=(1.0-smoothstep(28.0,29.0,max(abs(logo.x),abs(logo.y))))*step(2.0,abs(logo.x))*step(2.0,abs(logo.y));
        screenColor=mix(screenColor,float3(0.33,0.73,1.0),panes);
      }
      frame=over(float4(screenColor*screen,screen),frame);
      outColor=over(frame,outColor);
      if(k>=3) {
        float2 base=p-float2(endpoint,636.0);
        float4 laptop=material(base,float2(143.0,5.0),4.0,float3(0.16,0.24,0.32));
        outColor=over(laptop,outColor);
      }
      float2 glowPoint=(p-float2(endpoint,641.0))/float2(phone ? 78.0 : 160.0,10.0);
      float ground=exp(-dot(glowPoint,glowPoint))*0.3;
      outColor=over(float4(tint*ground,ground),outColor);
    }
  }
  if(desktop < 0.5) {
    // Glass project tile with a small document plate above the native label.
    outColor=over(material(p-float2(848,73),float2(135,72),23.0,float3(0.07,0.16,0.27)),outColor);
    outColor=over(material(p-float2(848,52),float2(30,35),5.0,float3(0.08,0.29,0.48)),outColor);
  } else {
    // The two desktop pipes pass behind this bright connecting glass bridge.
    float2 q=p-float2(1317.5,325.0);
    float halo=exp(-abs(roundedBox(q,float2(213,41),31.0))*0.075)*0.27;
    outColor=over(float4(float3(0.04,0.72,1.0)*halo,halo),outColor);
    outColor=over(material(q,float2(213,41),31.0,float3(0.02,0.28,0.39)),outColor);
  }
  return half4(min(outColor.rgb,float3(outColor.a)),outColor.a);
}`;
const effect = Skia.RuntimeEffect.Make(expoDesktopShader);
if (!effect) throw new Error("Could not compile Expo Desktop glass scene");

function GlassNetwork({ desktop }: { desktop: boolean }) {
  const uniforms = useAnimatedShaderUniforms({ desktop: desktop ? 1 : 0 }, 2);
  return <Canvas pointerEvents="none" style={{ width: 1696, height: 655 }}>
    <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
  </Canvas>;
}

export function ExpoDesktopLayers() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1696, height: 735, marginTop: 16, alignSelf: "center" }}>
    <GlassNetwork desktop={false} />
    <Text style={{ position: "absolute", left: 808, top: 25, width: 80, fontFamily: "Menlo", fontSize: 32,
      color: "#e6f7ff", textAlign: "center" }}>{"</>"}</Text>
    <Text style={{ position: "absolute", left: 688, top: 99, width: 320, fontSize: 27, fontWeight: "600",
      color: "#ffffff", textAlign: "center" }}>Your Expo project</Text>
    <SceneMotionView hidden={step < 1} pose={{ opacity: step >= 1 ? 1 : 0 }} duration={800}
      style={{ position: "absolute", left: 0, top: 0, width: 1696, height: 690 }}>
      <GlassNetwork desktop />
      <Text style={{ position: "absolute", left: 1105, top: 304, width: 425, fontSize: 34, lineHeight: 42,
        fontWeight: "600", color: "#ffffff", textAlign: "center" }}>Expo Desktop</Text>
      {["macOS", "Windows"].map((name, index) => <Text key={name} style={{ position: "absolute", top: 656,
        left: 1025 + index * 325, width: 260, fontSize: 28, fontWeight: "500", color: "#ffffff", textAlign: "center" }}>{name}</Text>)}
    </SceneMotionView>
    {["iOS", "Android", "Web"].map((name, index) => <Text key={name} style={{ position: "absolute", top: 656,
      left: 50 + index * 325, width: 260, fontSize: 28, fontWeight: "500", color: "#ffffff", textAlign: "center" }}>{name}</Text>)}
    <View style={{ position: "absolute", top: 703, width: 1696 }}>
      <SceneMotionView hidden={step < 2} pose={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }} duration={500}>
        <Text style={{ fontSize: 23, textAlign: "center", color: "#bdefff" }}>Legend Frame · desktop APIs + runtime + builds</Text>
      </SceneMotionView>
    </View>
  </View>;
}
