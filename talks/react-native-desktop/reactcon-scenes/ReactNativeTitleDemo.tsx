import { Canvas, Fill, ImageShader, Shader, Skia, matchFont } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";

const titles = ["Title", "Titl", "Tit", "Ti", "T", "", "H", "He", "Hel", "Hell", "Hello", "Hello ", "Hello R", "Hello RN"];
const rowHeight = 80;
// Pre-rasterize every edit once. The editor and window then select the exact
// same row in a single GPU evaluation, avoiding independent typing timers.
function makeAtlas() {
  const surface = Skia.Surface.Make(1600, titles.length * rowHeight);
  if (!surface) throw new Error("Could not create window title demo atlas");
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color("transparent"));
  const codeFont = matchFont({ fontFamily: "Menlo", fontSize: 32 });
  const titleFont = matchFont({ fontFamily: "Helvetica Neue", fontSize: 28, fontWeight: "600" });
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  const cell = codeFont.measureText("M").width;
  titles.forEach((title, index) => {
    const baseline = index * rowHeight + 51;
    paint.setColor(Skia.Color("#8bdfff"));
    canvas.drawText("useWindowTitle(", 0, baseline, paint, codeFont);
    paint.setColor(Skia.Color("#a7e5b2"));
    canvas.drawText(`"${title}"`, cell * 15, baseline, paint, codeFont);
    paint.setColor(Skia.Color("#eaf4ff"));
    canvas.drawText(")", cell * (17 + title.length), baseline, paint, codeFont);
    canvas.drawText(title, 1000 + (600 - titleFont.measureText(title).width) / 2, baseline, paint, titleFont);
  });
  const image = surface.makeImageSnapshot();
  codeFont.dispose(); titleFont.dispose(); paint.dispose(); surface.dispose();
  return { image, cell };
}
const atlas = makeAtlas();
export const titleDemoShader = `
uniform shader text;
uniform float time;
float box(float2 p,float2 c,float2 h,float r) { float2 q=abs(p-c)-h+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
half4 put(half4 c,float d,half3 color,float a) { a*=1.0-smoothstep(-0.7,0.7,d); return half4(color*a,a)+c*(1.0-a); }
half4 main(float2 p) {
  float t=min(time,5.8);
  // Reuse the same atlas backwards to erase Hello RN and type Title again.
  float row=0.0;
  if(t>=1.5 && t<2.5) row=min(5.0,1.0+floor((t-1.5)/0.2));
  else if(t>=2.5 && t<6.0) row=min(13.0,5.0+floor((t-2.5)/0.23));
  else if(t>=6.0 && t<7.6) row=max(5.0,12.0-floor((t-6.0)/0.2));
  else if(t>=7.6) row=max(0.0,5.0-floor((t-7.6)/0.23));
  float count=row<=5.0?5.0-row:row-5.0;
  half4 c=half4(0);
  for(int i=0;i<2;i++) {
    float x=i==0?405.0:1290.0;
    c=put(c,box(p,float2(x,295),float2(375,210),18),half3(0.045,0.08,0.13),1.0);
    c=put(c,abs(box(p,float2(x,295),float2(375,210),18))-1.0,half3(0.35,0.59,0.76),0.8);
    c=put(c,box(p,float2(x,113),float2(373,26),14),half3(0.11,0.17,0.23),1.0);
    for(int b=0;b<3;b++)c=put(c,length(p-float2(x-344.0+float(b)*20.0,111))-6.0,b==0?half3(1,0.4,0.4):b==1?half3(1,0.75,0.3):half3(0.35,0.8,0.45),1.0);
  }
  if(p.x>=80.0 && p.x<760.0 && p.y>=255.0 && p.y<335.0) {
    half4 ink=text.eval(float2(p.x-80.0,p.y-255.0+row*80.0)); c=ink+c*(1.0-ink.a);
  }
  if(p.x>=990.0 && p.x<1590.0 && p.y>=71.0 && p.y<151.0) {
    half4 ink=text.eval(float2(p.x-990.0+1000.0,p.y-71.0+row*80.0)); c=ink+c*(1.0-ink.a);
  }
  float cell=${atlas.cell.toFixed(6)};
  float2 destination=float2(80.0+cell*(16.0+count),294.0);
  float travel=smoothstep(0.2,0.65,t)*(1.0-smoothstep(10.0,10.5,t));
  float2 cursor=mix(float2(560,385),destination,travel);
  float blink=(t<4.5 || (t>=6.0 && t<8.8) || t>=10.0)?1.0:step(0.0,sin(t*6.0));
  c=put(c,box(p,cursor,float2(1.3,20),0),half3(0.85,0.96,1),blink);
  if(t<0.8 || t>=10.0) {
    c=put(c,box(p,cursor+float2(0,-20),float2(5,1),0),half3(0.85,0.96,1),1.0);
    c=put(c,box(p,cursor+float2(0,20),float2(5,1),0),half3(0.85,0.96,1),1.0);
  }
  float connection=smoothstep(1.5,1.8,time)*(1.0-smoothstep(4.8,5.1,time));
  float travelX=mix(760.0,990.0,fract(max(0.0,time-1.5)*1.2));
  float pulse=exp(-length(p-float2(travelX,294.0))/9.0)*connection;
  c=half4(half3(0.35,0.85,1.0)*pulse,pulse)+c*(1.0-pulse);
  // Subdued abstract app content keeps attention on the live native title.
  c=put(c,box(p,float2(1010,318),float2(65,150),10),half3(0.10,0.17,0.24),1.0);
  for(int line=0;line<4;line++)c=put(c,box(p,float2(1340,205.0+float(line)*58.0),float2(175.0-float(line)*20.0,8),5),half3(0.17,0.27,0.36),0.7);
  return c;
}`;
const effect = Skia.RuntimeEffect.Make(titleDemoShader);
if (!effect) throw new Error("Could not compile React Native title demo");

export function ReactNativeTitleDemo() {
  const uniforms = useAnimatedShaderUniforms({}, 5);
  return <Canvas accessibilityLabel={'Editing useWindowTitle("Title") to useWindowTitle("Hello RN") and back in a loop updates the native window title in sync'} style={{ width: 1696, height: 600, alignSelf: "center", marginTop: 32 }}>
    <Fill><Shader source={effect!} uniforms={uniforms}>
      <ImageShader image={atlas.image} x={0} y={0} width={1600} height={titles.length * rowHeight} fit="fill" tx="decal" ty="decal" />
    </Shader></Fill>
  </Canvas>;
}
