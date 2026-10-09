import { Canvas, Fill, ImageShader, Shader, Skia, matchFont } from "@shopify/react-native-skia";
import { useAnimatedShaderUniforms } from "@legend-apps/presentation";

function makeLabels() {
  const surface = Skia.Surface.Make(600, 240);
  if (!surface) throw new Error("Could not create adaptive app labels");
  const canvas = surface.getCanvas(); canvas.clear(Skia.Color("transparent"));
  const paint = Skia.Paint(); paint.setAntiAlias(true); paint.setColor(Skia.Color("#f1f5f9"));
  const font = matchFont({ fontFamily: "Helvetica Neue", fontSize: 23, fontWeight: "600" });
  ["Chat History", "legend.so", "Conversation"].forEach((text, row) => canvas.drawText(text, 0, row * 80 + 48, paint, font));
  const image = surface.makeImageSnapshot(); font.dispose(); paint.dispose(); surface.dispose(); return image;
}
const labels = makeLabels();
const tabFont = matchFont({ fontFamily: "Helvetica Neue", fontSize: 23, fontWeight: "600" });
const tabTitleWidth = tabFont.measureText("Chat History").width;
tabFont.dispose();
// All dimensions and child positions interpolate from one shared GPU timeline. The app
// reflows inside the device rather than scaling a screenshot of the phone.
export const everywhereShader = `
uniform shader labels;
uniform float time;
float box(float2 p,float2 c,float2 h,float r) { float2 q=abs(p-c)-h+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
half4 put(half4 c,float d,half3 tint,float a) { a*=1.0-smoothstep(-0.7,0.7,d); return half4(tint*a,a)+c*(1.0-a); }
half4 label(half4 c,float2 p,float2 origin,float row,float a) {
  float2 q=p-origin;
  if(q.x>=0.0 && q.x<220.0 && q.y>=0.0 && q.y<65.0) { half4 ink=labels.eval(q+float2(0,row*80.0))*a; return ink+c*(1.0-ink.a); }
  return c;
}
half4 main(float2 p) {
  // Pause at each form, then morph; the return trip retraces the same layout.
  float clock=mod(time,21.6)/3.6;
  float leg=floor(clock);
  float progress=smoothstep(0.38,0.92,fract(clock));
  float phase=leg<3.0?leg+progress:6.0-leg-progress;
  float tablet=clamp(phase,0.0,1.0), browser=clamp(phase-1.0,0.0,1.0), desktop=clamp(phase-2.0,0.0,1.0);
  float width=mix(302.0,860.0,tablet)+browser*440.0+desktop*80.0;
  float height=mix(650.0,590.0,tablet)-browser*20.0;
  float radius=mix(43.0,30.0,tablet)*(1.0-browser)+browser*14.0;
  float2 center=float2(848,355);
  float left=center.x-width*0.5, top=center.y-height*0.5;
  float frame=box(p,center,float2(width,height)*0.5,radius);
  half4 c=half4(0);
  c=put(c,frame-13.0,half3(0.08,0.22,0.36),0.12);
  c=put(c,frame-5.0,half3(0.16,0.36,0.53),0.25);
  float sheen=0.5+0.5*sin((p.x+p.y)*0.006+time*0.25);
  c=put(c,frame,mix(half3(0.28,0.36,0.45),half3(0.66,0.78,0.88),sheen),1.0);
  c=put(c,frame+2.0,half3(0.025,0.045,0.075),1.0);
  float bezel=mix(11.0,3.0,browser);
  float screen=box(p,center,float2(width,height)*0.5-bezel,max(8.0,radius-bezel));
  float surfaceLight=clamp(1.0-(p.y-top)/height,0.0,1.0);
  c=put(c,screen,mix(half3(0.04,0.075,0.12),half3(0.085,0.15,0.22),surfaceLight),1.0);
  c=put(c,abs(screen)-0.55,half3(0.40,0.63,0.79),0.35);
  float mobile=1.0-browser;
  c=put(c,box(p,float2(848,top+24.0),float2(mix(45.0,4.0,tablet),mix(12.0,4.0,tablet)),12.0),half3(0),mobile);
  c=put(c,box(p,float2(848,top+height-20.0),float2(48,2.5),2.5),half3(0.8),mobile);
  float chromeHeight=browser*(72.0-desktop*30.0);
  float contentTop=top+52.0+chromeHeight;
  float contentBottom=top+height-36.0;
  float innerLeft=left+22.0;
  float sidebarWidth=tablet*190.0;
  float splitWidth=desktop*265.0;
  float chatLeft=innerLeft+sidebarWidth;
  float chatRight=left+width-22.0-splitWidth;
  // The browser toolbar retracts into a native titlebar on the final step.
  c=put(c,box(p,float2(848,top+chromeHeight*0.5+8.0),float2(width*0.5-5.0,chromeHeight*0.5),10),half3(0.14,0.19,0.25),browser);
  // On macOS the sidebar surface extends behind the traffic lights, clipped
  // to the window's rounded screen. Keep it below the controls in draw order.
  float sidebarTop=mix(contentTop,top+bezel,desktop);
  float sidebarBottom=mix(contentBottom,top+height-bezel,desktop);
  float sidebarLeft=mix(innerLeft+10.0,left+bezel,desktop);
  float sidebarRight=innerLeft+sidebarWidth-10.0;
  float sidebar=box(p,float2((sidebarLeft+sidebarRight)*0.5,(sidebarTop+sidebarBottom)*0.5),float2(max(0.0,(sidebarRight-sidebarLeft)*0.5),(sidebarBottom-sidebarTop)*0.5),mix(10.0,0.0,desktop));
  c=put(c,max(sidebar,screen),half3(0.11,0.18,0.25),tablet);
  for(int i=0;i<3;i++)c=put(c,length(p-float2(left+23.0+float(i)*18.0,top+23.0))-5.0,i==0?half3(1,0.4,0.4):i==1?half3(1,0.76,0.35):half3(0.35,0.8,0.45),browser);
  c=put(c,box(p,float2(left+240.0,top+24.0),float2(125,17),8),half3(0.22,0.28,0.34),browser*(1.0-desktop));
  c=put(c,box(p,float2(848,top+58.0),float2(width*0.5-100.0,14),14),half3(0.07,0.11,0.16),browser*(1.0-desktop));
  c=label(c,p,float2(left+240.0-${(tabTitleWidth / 2).toFixed(6)},top-15.0),0,browser*(1.0-desktop));
  c=label(c,p,float2(755,top+18.0),1,browser*(1.0-desktop));
  c=label(c,p,float2(chatLeft+14.0,top-14.0),0,desktop);
  // A sidebar appears as width becomes available, keeping readable row sizes.
  for(int row=0;row<6;row++) {
    float y=contentTop+40.0+float(row)*51.0;
    c=put(c,length(p-float2(innerLeft+25.0,y))-8.0,half3(0.3,0.65,0.92),tablet);
    c=put(c,box(p,float2(innerLeft+102.0,y),float2(52,4),3),half3(0.43,0.56,0.68),tablet);
  }
  c=label(c,p,float2(chatLeft+14.0,contentTop-22.0),0,1.0);
  float available=chatRight-chatLeft-30.0;
  for(int row=0;row<4;row++) {
    float w=available*(mod(float(row),2.0)<0.5?0.87:0.74);
    float x=mod(float(row),2.0)<0.5?chatLeft+15.0:chatRight-15.0-w;
    float y=contentTop+74.0+float(row)*76.0;
    c=put(c,box(p,float2(x+w*0.5,y),float2(w*0.5,29),10),mod(float(row),2.0)<0.5?half3(0.15,0.24,0.33):half3(0.15,0.36,0.57),1.0);
    c=put(c,box(p,float2(x+w*0.43,y-7.0),float2(w*0.34,3),2),half3(0.59,0.75,0.87),0.8);
    c=put(c,box(p,float2(x+w*0.29,y+8.0),float2(w*0.20,3),2),half3(0.45,0.61,0.75),0.7);
  }
  c=put(c,box(p,float2((chatLeft+chatRight)*0.5,contentBottom-22.0),float2(available*0.5,21),18),half3(0.22,0.35,0.46),1.0);
  c=put(c,abs(box(p,float2((chatLeft+chatRight)*0.5,contentBottom-22.0),float2(available*0.5,21),18))-0.6,half3(0.65,0.85,1),0.7);
  // Native desktop split view opens a second conversation beside the first.
  float splitLeft=left+width-22.0-splitWidth;
  c=put(c,box(p,float2(splitLeft, (contentTop+contentBottom)*0.5),float2(1,(contentBottom-contentTop)*0.5),0),half3(0.4,0.6,0.75),desktop);
  c=label(c,p,float2(splitLeft+20.0,contentTop-22.0),2,desktop);
  for(int row=0;row<5;row++)c=put(c,box(p,float2(splitLeft+132.0,contentTop+65.0+float(row)*56.0),float2(105,18),8),half3(0.16,0.27,0.38),desktop);
  return c;
}`;
const effect = Skia.RuntimeEffect.Make(everywhereShader);
if (!effect) throw new Error("Could not compile adaptive app morph");

export function EverywhereMorph() {
  const uniforms = useAnimatedShaderUniforms({}, 8.5);
  return <Canvas accessibilityLabel="Chat History continuously morphs from iPhone to iPad, Chrome, and a native split-view window, then reverses" style={{ width: 1696, height: 720, alignSelf: "center", marginTop: 20 }}>
    <Fill><Shader source={effect!} uniforms={uniforms}><ImageShader image={labels} x={0} y={0} width={600} height={240} fit="fill" tx="decal" ty="decal" /></Shader></Fill>
  </Canvas>;
}
