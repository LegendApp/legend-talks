import { Canvas, Fill, LinearGradient, Path, RoundedRect, Shader, Skia, vec } from "@shopify/react-native-skia";
import { SceneMotionView, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { Text, View } from "react-native";

const cyan = "#85e5ff";
const frames = [
  { label: "Click", x: 0, y: 46, width: 450, height: 340, center: 225 },
  { label: "Window", x: 480, y: 46, width: 450, height: 340, center: 705 },
  { label: "First content", x: 960, y: 12, width: 650, height: 408, center: 1285 },
];

// Each GPU loop starts at its own reveal step on the shared playback clock.
// Outgoing slides freeze and presenter previews sample a still frame.
const launchEffect = Skia.RuntimeEffect.Make(`
uniform float time;
uniform float stage;
uniform float stepIndex;
uniform float2 resolution;
float rect(float2 p,float2 center,float2 size,float radius) {
  float2 q=abs(p-center)-size+radius;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
}
half4 over(half4 base,float distance,half3 color,float opacity) {
  float a=(1.0-smoothstep(-0.7,0.7,distance))*opacity;
  return half4(color*a,a)+base*(1.0-a);
}
float triangle(float2 p,float2 a,float2 b,float2 c) {
  float2 e0=b-a,e1=c-b,e2=a-c;
  float2 v0=p-a,v1=p-b,v2=p-c;
  float2 q0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.0,1.0);
  float2 q1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.0,1.0);
  float2 q2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.0,1.0);
  float orientation=sign(e0.x*e2.y-e0.y*e2.x);
  float2 d=min(min(float2(dot(q0,q0),orientation*(v0.x*e0.y-v0.y*e0.x)),
    float2(dot(q1,q1),orientation*(v1.x*e1.y-v1.y*e1.x))),
    float2(dot(q2,q2),orientation*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y);
}
half4 main(float2 p) {
  float cycle=stage<0.5?1.6:stage<1.5?1.8:2.4;
  float t=stepIndex<stage?0.0:mod(time,cycle);
  half4 color=half4(0);
  float reset=1.0-smoothstep(cycle-0.35,cycle-0.05,t);
  if(stage<0.5) {
    float2 target=float2(resolution.x*0.5,resolution.y-37.0);
    float move=smoothstep(0.1,0.38,t);
    float2 start=target+float2(-38.0,-42.0);
    float2 cursor=mix(start,target,move);
    cursor=mix(cursor,start,smoothstep(1.25,1.55,t));
    float click=smoothstep(0.4,0.48,t)*(1.0-smoothstep(0.48,0.66,t));
    float rebound=sin(clamp((t-0.48)/0.35,0.0,1.0)*3.14159)*0.12;
    float scale=0.65*(1.0-click*0.25+rebound);
    float wave=clamp((t-0.45)/0.8,0.0,1.0);
    float ring=abs(length(p-target)-(8.0+wave*48.0))-1.5;
    color=over(color,ring,half3(0.48,0.86,1),step(0.45,t)*(1.0-wave));
    float2 q=(p-cursor)/scale;
    float arrow=min(triangle(q,float2(0),float2(0,43),float2(12,31)),
      triangle(q,float2(0),float2(12,31),float2(35,26)));
    arrow=min(arrow,triangle(q,float2(12,27),float2(24,49),float2(31,45)));
    arrow=min(arrow,triangle(q,float2(12,27),float2(31,45),float2(19,25)));
    color=over(color,arrow*scale-2.0,half3(0.04,0.09,0.15),1.0);
    return over(color,arrow*scale,half3(0.92,0.97,1),1.0);
  }
  float opening=stage<1.5?smoothstep(0.1,0.9,t):1.0;
  float scale=mix(0.07,1.0,opening);
  float2 center=float2(resolution.x*0.5,(resolution.y-22.0)*0.5);
  float2 dock=float2(resolution.x*0.5,resolution.y-29.0);
  float2 q=(p-mix(dock,center,opening))/scale+center;
  float visible=stage<1.5?smoothstep(0.1,0.25,t)*reset:1.0;
  float window=rect(q,center,float2(resolution.x-96.0,resolution.y-102.0)*0.5,15.0);
  color=over(color,window*scale,half3(0.4,0.5,0.59),visible);
  color=over(color,(window+1.5)*scale,half3(0.043,0.094,0.145),visible);
  for(int i=0;i<3;i++) {
    half3 tint=i==0?half3(1,0.42,0.41):i==1?half3(0.97,0.76,0.36):half3(0.44,0.82,0.5);
    color=over(color,(length(q-float2(65.0+float(i)*17.0,57))-5.0)*scale,tint,visible);
  }
  if(stage>1.5) {
    float sidebar=smoothstep(0.1,0.5,t)*reset;
    float2 sp=p+float2((1.0-sidebar)*18.0,0);
    color=over(color,rect(sp,float2(128,78.0+(resolution.y-152.0)*0.5),float2(69,(resolution.y-152.0)*0.5),9),half3(0.118,0.188,0.259),sidebar);
    for(int i=0;i<5;i++) {
      float a=smoothstep(0.25+float(i)*0.12,0.55+float(i)*0.12,t)*reset;
      float y=99.0+float(i)*39.0+(1.0-a)*10.0;
      color=over(color,length(p-float2(77,y))-9.0,half3(0.32,0.61,0.88),a);
      color=over(color,rect(p,float2(136,y-1.0),float2(41,3),3),half3(0.43,0.55,0.64),a);
    }
    for(int i=0;i<4;i++) {
      float a=smoothstep(0.5+float(i)*0.2,0.9+float(i)*0.2,t)*reset;
      float x=218.0+mod(float(i),2.0)*72.0;
      float y=86.0+float(i)*49.0+(1.0-a)*18.0;
      color=over(color,rect(p,float2(x+105.0,y+19.0),float2(105,19),10),mod(float(i),2.0)<0.5?half3(0.17,0.25,0.33):half3(0.15,0.37,0.62),a);
      color=over(color,rect(p,float2(x+90.0,y+15.5),float2(74,2.5),2.5),half3(0.55,0.70,0.86),a);
      color=over(color,rect(p,float2(x+63.0,y+26.0),float2(47,2),2),half3(0.41,0.55,0.68),a);
    }
    float composer=smoothstep(1.3,1.7,t)*reset;
    color=over(color,rect(p,float2(resolution.x*0.5+75.0,resolution.y-83.5),float2((resolution.x-282.0)*0.5,11.5),10),half3(0.14,0.22,0.30),composer);
  }
  return color;
}`);
if (!launchEffect) throw new Error("Could not compile measurement timeline animation");

function LaunchFrame({ stage, width, height }: { stage: number; width: number; height: number }) {
  const uniforms = useAnimatedShaderUniforms({ stage, resolution: [width, height] }, stage < 0.5 ? 0.9 : stage < 1.5 ? 1.1 : 1.8, { clock: stage });
  return <Canvas style={{ width, height }}>
    <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={20}>
      <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={["#203951", "#091420", "#163047"]} />
    </RoundedRect>
    <RoundedRect x={1} y={1} width={width - 2} height={height - 2} r={20} color="#5e7b94" style="stroke" strokeWidth={2} />
    <Path path={`M 0 ${height * 0.55} C ${width * 0.4} ${height * 0.62}, ${width * 0.55} ${height * 0.96}, ${width} ${height * 0.86}`} color="#3f7bbc" style="stroke" strokeWidth={2} />
    <RoundedRect x={width / 2 - 91} y={height - 43} width={182} height={31} r={10} color="#46576980" />
    {[0, 1, 2, 3, 4].map(i => <RoundedRect key={i} x={width / 2 - 78 + i * 33} y={height - 37} width={23} height={20} r={5} color={i % 2 ? "#6688b0" : "#70b1ed"} />)}
    <Fill><Shader source={launchEffect!} uniforms={uniforms} /></Fill>
  </Canvas>;
}

export function MeasurementTimeline() {
  const step = Math.min(usePresentationValue("stepIndex"), 2);
  return <View accessibilityLabel="Video frames: click, window opens, first visible content. Measure from click to first content." style={{ width: 1610, height: 680, alignSelf: "center", marginTop: 24 }}>
    {frames.map((frame, index) => <View key={frame.label} style={{ position: "absolute", left: frame.x, top: frame.y }}>
      <SceneMotionView pose={{ opacity: step >= index ? 1 : 0.35 }} duration={550}>
        <LaunchFrame stage={index} width={frame.width} height={frame.height} />
      </SceneMotionView>
      {index === 2 && <SceneMotionView pointerEvents="none" pose={{ opacity: step === 2 ? 1 : 0 }} duration={650}
        style={{ position: "absolute", inset: -8, borderRadius: 26, borderWidth: 3, borderColor: cyan, shadowColor: cyan, shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }} />}
    </View>)}
    <View style={{ position: "absolute", left: 0, right: 0, top: 485, height: 1, backgroundColor: "#355c73" }} />
    {frames.map(frame => <View key={frame.label} style={{ position: "absolute", left: frame.center - 150, top: 435, width: 300, alignItems: "center" }}>
      <View style={{ height: 50, width: 1, backgroundColor: "#507b94" }} />
      <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: -6, backgroundColor: cyan }} />
      <Text style={{ color: "#f1f5f9", fontSize: 28, marginTop: 20 }}>{frame.label}</Text>
    </View>)}
    <SceneMotionView pose={{ x: frames[step].center - frames[0].center }} duration={900}
      style={{ position: "absolute", left: frames[0].center - 12, top: 473, width: 24, height: 24, borderRadius: 12, backgroundColor: cyan, shadowColor: cyan, shadowOpacity: 0.9, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }} />
  </View>;
}
