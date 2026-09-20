import { Canvas, Fill, Path, Shader, Skia } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

// Analytic glass pipes and devices. A shared UI-thread clock moves the light
// particles; no snapshots, texture uploads, or per-frame JS geometry updates.
export const expoDesktopShader = `
uniform float time;
uniform float desktop;
uniform float connected;
float roundedBox(float2 p, float2 size, float radius) {
  float2 q=abs(p)-size+radius;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
}
float4 over(float4 a,float4 b) { return a+b*(1.0-a.a); }
float4 material(float2 p,float2 size,float radius,float3 tint) {
  float d=roundedBox(p,size,radius);
  float mask=1.0-smoothstep(-0.8,0.8,d);
  float rim=exp(-abs(d+1.7)*0.7);
  float bevel=exp(-abs(d+7.5)*0.24);
  float innerRim=exp(-abs(d+15.0)*0.7);
  float halo=exp(-max(d,0.0)*0.065)*(1.0-mask)*0.32;
  float2 uv=p/size;
  float reflectionAxis=(uv.y+0.68+uv.x*0.18)*7.0;
  float reflection=exp(-reflectionAxis*reflectionAxis);
  float sweep=uv.x*0.5+uv.y+0.12*sin(uv.x*4.0);
  float ribbon=exp(-abs(sweep+0.52)*17.0);
  float caustic=exp(-abs(sweep-0.55)*24.0);
  float directional=0.35+0.65*pow(0.5+0.5*cos(atan(p.y,p.x)*2.0-0.65),2.0);
  float3 color=tint*(0.65+reflection*0.85)
    +float3(0.76,0.91,1.0)*rim*directional
    +float3(0.28,0.57,0.80)*bevel*(0.4+reflection)
    +float3(0.17,0.42,0.58)*innerRim
    +float3(0.16,0.31,0.43)*ribbon+float3(0.07,0.20,0.31)*caustic;
  return float4(color*mask+float3(0.25,0.63,0.95)*halo,clamp(mask*0.96+halo,0.0,1.0));
}
float pathX(float t,float i) {
  float start=912.0+(i-2.0)*70.0;
  float end=160.0+i*376.0;
  if(i>=3.0) {
    float bridge=1288.0+(i-3.0)*376.0;
    float upper=clamp(t/0.50625,0.0,1.0);
    float lower=clamp((t-0.50625)/0.49375,0.0,1.0);
    return t<0.50625 ? mix(start,bridge,upper*upper*(3.0-2.0*upper))
      : mix(bridge,end,lower*lower*(3.0-2.0*lower));
  }
  float ease=t*t*(3.0-2.0*t);
  return mix(start,end,ease);
}
// Distance to the curved centerline, rather than its local tangent. The
// tangent approximation flares out at the tight bend below the project tile.
float pipeDistance(float2 p,float i) {
  float distanceSquared=1e10;
  float side=1.0;
  float2 a=float2(pathX(0.0,i),188.0);
  for(int segment=1;segment<=32;segment++) {
    float t=float(segment)/32.0;
    float2 b=float2(pathX(t,i),188.0+t*320.0);
    float2 ab=b-a;
    float h=clamp(dot(p-a,ab)/dot(ab,ab),0.0,1.0);
    float2 delta=p-(a+h*ab);
    float candidate=dot(delta,delta);
    if(candidate<distanceSquared) {
      distanceSquared=candidate;
      side=sign(delta.x*ab.y-delta.y*ab.x);
    }
    a=b;
  }
  return sqrt(distanceSquared)*side;
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
      float endpoint=160.0+i*376.0;
      float3 tint=k<3 ? float3(0.24,0.43,0.70) : float3(0.04,0.67,0.90);
      // Broad, curved tubes, with a transparent core and two refractive rims.
      if(p.y>=187.0 && p.y<=511.0) {
        float t=clamp((p.y-188.0)/320.0,0.0,1.0);
        float d=pipeDistance(p,i);
        float radius=(21.0+desktop*4.0)*(1.0+0.07*sin(t*8.0+i));
        float n=d/radius;
        float body=1.0-smoothstep(0.94,1.04,abs(n));
        // Cylindrical lighting: silver rim, broad specular ribbon, dark core,
        // and an opposing cyan caustic make the tubes read as solid glass.
        float rim=exp(-abs(abs(n)-0.94)*radius*0.95);
        float innerRim=exp(-abs(abs(n)-0.70)*radius*0.65)*body;
        float front=exp(-(n+0.48)*(n+0.48)*48.0)*body;
        float reflection=exp(-(n-0.28)*(n-0.28)*16.0)*body;
        float caustic=exp(-abs(n-0.78)*32.0)*body;
        float glow=exp(-abs(d)*0.045)*0.30;
        float wave=0.8+0.2*sin(t*12.0-time*1.4+i);
        float grid=exp(-abs(sin((p.y+n*n*14.0)*0.037))*35.0)*body;
        float progress=desktop<0.5 ? 1.0 : connected*smoothstep(0.5,2.5,time);
        float reveal=1.0-smoothstep(progress-0.015,progress+0.015,t);
        if(desktop>0.5 && connected<0.5) reveal=0.0;
        float fade=smoothstep(185.0,193.0,p.y)*(1.0-smoothstep(499.0,511.0,p.y))*reveal;
        float3 pipe=tint*(body*0.22+reflection*0.46+glow)
          +float3(0.78,0.92,1.0)*(rim*0.96+front*0.80*wave)
          +float3(0.32,0.66,0.90)*(innerRim*0.52+caustic*0.86+grid*0.14);
        float alpha=clamp(body*0.90+rim*0.15+glow,0.0,1.0)*fade;
        outColor=over(float4(min(pipe*fade,float3(alpha)),alpha),outColor);
        // Stable size/brightness variation gives each light its own identity
        // while all particles continue down the same project-to-device path.
        for(int j=0;j<16;j++) {
          float travel=fract(float(j)/16.0+time*0.18+i*0.071);
          float2 dotPosition=float2(pathX(travel,i),188.0+travel*320.0);
          float seed=fract(sin(float(j)*127.1+i*71.7+19.3)*43758.5453);
          float brightness=fract(sin(float(j)*53.9+i*143.3+7.1)*17341.17);
          float particleSlope=(pathX(min(1.0,travel+0.001),i)-pathX(max(0.0,travel-0.001),i))/0.640;
          dotPosition+=normalize(float2(1.0,-particleSlope))*(seed-0.5)*19.0;
          float distance=length(p-dotPosition);
          float size=mix(1.6,5.7,seed);
          float intensity=mix(0.38,1.45,brightness)*(0.88+0.12*sin(time*2.0+float(j)));
          float spark=(exp(-distance*distance/(size*size))+exp(-distance/(size*2.6))*0.40)*intensity;
          float alpha=clamp(spark,0.0,0.96)*fade;
          outColor=over(float4(float3(0.90,0.97,1.0)*alpha,alpha),outColor);
        }
      }
      // Devices share a bottom baseline, as in the selected concept.
      bool phone=k<2;
      float2 size=phone ? float2(57.0,103.0) : float2(130.0,86.0);
      float2 center=float2(endpoint,phone ? 563.0 : 580.0);
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
        float2 base=p-float2(endpoint,672.0);
        float4 laptop=material(base,float2(143.0,5.0),4.0,float3(0.16,0.24,0.32));
        outColor=over(laptop,outColor);
      }
      float2 glowPoint=(p-float2(endpoint,677.0))/float2(phone ? 78.0 : 160.0,10.0);
      float ground=exp(-dot(glowPoint,glowPoint))*0.3;
      outColor=over(float4(tint*ground,ground),outColor);
    }
  }
  if(desktop < 0.5) {
    // Glass project tile behind the Expo mark and native label.
    outColor=over(material(p-float2(919,108),float2(192,88),23.0,float3(0.025,0.085,0.16)),outColor);
    outColor=over(material(p-float2(912,100),float2(190,88),23.0,float3(0.07,0.16,0.27)),outColor);
  } else {
    // The two desktop pipes pass behind this bright connecting glass bridge.
    float2 q=p-float2(1476,350.0);
    float appear=connected*smoothstep(0.0,0.45,time);
    float halo=exp(-abs(roundedBox(q,float2(221,41),31.0))*0.045)*0.42*appear;
    outColor=over(float4(float3(0.04,0.72,1.0)*halo,halo),outColor);
    outColor=over(material(q-float2(8,10),float2(224,44),29.0,float3(0.015,0.18,0.26))*appear,outColor);
    outColor=over(material(q,float2(221,41),29.0,float3(0.025,0.29,0.39))*appear,outColor);
  }
  return half4(min(outColor.rgb,float3(outColor.a)),outColor.a);
}`;
const effect = Skia.RuntimeEffect.Make(expoDesktopShader);
if (!effect) throw new Error("Could not compile Expo Desktop glass scene");

// Expo brand mark from https://github.com/simple-icons/simple-icons/blob/develop/icons/expo.svg
const expoLogo = "M0 20.084c.043.53.23 1.063.718 1.778.58.849 1.576 1.315 2.303.567.49-.505 5.794-9.776 8.35-13.29a.761.761 0 011.248 0c2.556 3.514 7.86 12.785 8.35 13.29.727.748 1.723.282 2.303-.567.57-.835.728-1.42.728-2.046 0-.426-8.26-15.798-9.092-17.078-.8-1.23-1.044-1.498-2.397-1.542h-1.032c-1.353.044-1.597.311-2.398 1.542C8.267 3.991.33 18.758 0 19.77Z";

function GlassNetwork({ desktop, connected = false }: { desktop: boolean; connected?: boolean }) {
  const uniforms = useAnimatedShaderUniforms({ desktop: desktop ? 1 : 0, connected: connected ? 1 : 0 }, 3);
  return <Canvas pointerEvents="none" style={{ width: 1824, height: 691 }}>
    <Fill><Shader source={effect!} uniforms={uniforms} /></Fill>
    {!desktop && <Path path={expoLogo} color="#e6f7ff" transform={[{ translateX: 880 }, { translateY: 44 }, { scale: 64 / 24 }]} />}
  </Canvas>;
}

export function ExpoDesktopLayers() {
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1824, height: 771, marginTop: 0, alignSelf: "center" }}>
    <GlassNetwork desktop={false} />
    <View style={{ position: "absolute", left: 0, top: 0, width: 1824, height: 726 }}>
      <GlassNetwork key={step >= 1 ? "connected" : "isolated"} desktop connected={step >= 1} />
      <Text accessibilityLabel="Apple logo" style={{ position: "absolute", left: 1238, top: 527, width: 100,
        fontFamily: "Helvetica Neue", fontSize: 72, lineHeight: 88, color: "#83d6ff", textAlign: "center",
        textShadowColor: "#418de0", textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } }}>{"\uF8FF"}</Text>
      <SceneMotionView hidden={step < 1} initialPose={{ opacity: 0 }} pose={{ opacity: step >= 1 ? 1 : 0 }} duration={450}>
      <Text style={{ position: "absolute", left: 1255, top: 329, width: 442, fontSize: 34, lineHeight: 42,
        fontWeight: "600", color: "#ffffff", textAlign: "center" }}>Expo Desktop</Text>
      </SceneMotionView>
      {["macOS", "Windows"].map((name, index) => <Text key={name} style={{ position: "absolute", top: 692,
        left: 1158 + index * 376, width: 260, fontSize: 28, fontWeight: "500", color: "#ffffff", textAlign: "center" }}>{name}</Text>)}
    </View>
    {["iOS", "Android", "Web"].map((name, index) => <Text key={name} style={{ position: "absolute", top: 692,
      left: 30 + index * 376, width: 260, fontSize: 28, fontWeight: "500", color: "#ffffff", textAlign: "center" }}>{name}</Text>)}
  </View>;
}
