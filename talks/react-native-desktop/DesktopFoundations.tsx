import { Blur, Canvas, Fill, Group, ImageShader, Paint, RuntimeShader, Shader, Skia, matchFont } from "@shopify/react-native-skia";
import { liquidGlassShader, useLiquidGlassPlayback, useAnimatedShaderUniforms, usePresentationValue } from "@legend-apps/presentation";
import { View } from "react-native";
import { FrameTitle } from "./FramePitch";
import { glassPanelMaterial } from "./GlassPanels";

const capabilities = ["Windows", "Native menus", "Keyboard shortcuts", "Files & folders", "Open / save dialogs",
  "Drag & drop", "Clipboard", "Notifications", "Tray / menu bar", "Media controls",
  "Deep links", "App lifecycle", "Preferences", "Permissions", "Updates"];
const publishing = ["Project setup", "Native linking", "Release builds", "Binary size", "Compatibility patches",
  "Signing & entitlements", "Notarization", "Packaging", "Publishing", "Updates"];
const command = "npx @legendapp/spark create";
const features = capabilities.map((label, i) => ({
  label, row: i, wave: Math.floor(i / 5) + 1,
  x: i < 5 ? 154 : i < 10 ? 1542 : i < 13 ? 498 + (i - 10) * 350 : 648 + (i - 13) * 400,
  y: i < 10 ? 110 + (i % 5) * 112 : i < 13 ? 46 : 614,
}));
const shipping = publishing.map((label, i) => ({
  label, row: capabilities.length + i, wave: 4,
  x: i < 5 ? 340 : 1356, y: 105 + (i % 5) * 112,
}));
const rows = [...capabilities, ...publishing, "Your app", command];
const appRow = 25, commandRow = 26;
const atlasWidth = 1600, rowHeight = 100;
// Text is rasterized once. Motion, ripple, blur, cursor morph and character
// reveal sample the same UI/GPU timeline; no native text reset can lag behind.
function makeTextAtlas() {
  const surface = Skia.Surface.Make(atlasWidth, rows.length * rowHeight);
  if (!surface) throw new Error("Could not create Spark text atlas");
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color("transparent"));
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color("white"));
  let cell = 0;
  rows.forEach((label, row) => {
    const font = matchFont({ fontFamily: row === commandRow ? "Menlo" : "Helvetica Neue",
      fontSize: row === commandRow ? 60 : row === appRow ? 32 : 27, fontWeight: "600" });
    const bounds = font.measureText(label);
    canvas.drawText(label, (atlasWidth - bounds.width) / 2 - bounds.x,
      row * rowHeight + (rowHeight - bounds.height) / 2 - bounds.y, paint, font);
    if (row === commandRow) cell = bounds.width / command.length;
    font.dispose();
  });
  const image = surface.makeImageSnapshot();
  paint.dispose();
  surface.dispose();
  return { image, cell };
}
const atlas = makeTextAtlas();
const geometry = `
float box(float2 p,float2 size,float r) {
  float2 q=abs(p)-size+r;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;
}
float segment(float2 p,float2 a,float2 b) {
  float2 v=b-a;
  return length(p-a-v*clamp(dot(p-a,v)/max(dot(v,v),0.001),0.0,1.0));
}
`;
export const foundationsNetworkShader = `
uniform shader labels;
uniform float padding;
uniform float time;
uniform float slideTime;
uniform float stepTime;
uniform float stepIndex;
uniform float kind;
const float pulse=0.003;
const float edgeMotion=1.2;
${glassPanelMaterial}
${geometry}
half4 textAt(float2 p,float row) {
  if(abs(p.y)>49.0 || abs(p.x)>799.0) return half4(0);
  return labels.eval(p+float2(800,row*100.0+50.0));
}
half4 main(float2 p) {
  p -= float2(padding);
  float collapse=stepIndex>=5.0 ? smoothstep(0.0,1.35,time) : 0.0;
  float visibility=1.0-collapse;
  float2 hub=float2(848,330);
  float3 light=float3(0);
  float alpha=0.0;
  half4 ink=half4(0);
  half4 panels=half4(0);
  ${[...features, ...shipping].map((n, i) => `{
    if(kind==${i < features.length ? "0.0" : "1.0"}) {
      float delay=${i < features.length ? ((i % 5) * .10).toFixed(2) : (0.55 + (i - features.length) * .08).toFixed(2)};
      float growth=stepIndex>${n.wave}.0 ? 1.0 : stepIndex<${n.wave}.0 ? 0.0 : smoothstep(delay,delay+0.65,stepTime);
      float2 end=mix(hub,float2(${n.x}.0,${n.y}.0),growth*visibility);
      float show=growth*visibility;
      float d=segment(p,hub,end);
      float pulse=0.8+0.2*sin(slideTime*2.0+${i}.0);
      float line=(exp(-d*0.20)*0.22+exp(-d*1.4)*0.8)*show;
      half4 panel=half4(glassPanel((p-end)/max(0.01,visibility),float2(145,36),17.0,slideTime+${i}.0*1.7))*show;
      panels=panel+panels*(1.0-panel.a);
      light+=float3(0.22,0.75,1.0)*line*pulse;
      for(int j=0;j<3;j++) {
        float travel=fract(slideTime*(0.65+${(i % 3 * .12).toFixed(2)})+float(j)/3.0+${(i * .17).toFixed(2)});
        float2 particle=mix(end,hub,travel);
        float spark=exp(-length(p-particle)/(2.0+float(j)*1.1))*show;
        light+=float3(0.5,0.86,1.0)*spark*(1.5+float(j));
      }
      half4 label=textAt((p-end)/max(0.01,visibility),${n.row}.0)*show;
      ink=label+ink*(1.0-label.a);
    }
  }`).join("\n")}
  if(kind<0.5) {
    half4 panel=half4(glassPanel((p-hub)/max(0.01,visibility),float2(140,83),24.0,slideTime))*visibility;
    panels=panel+panels*(1.0-panel.a);
    half4 label=textAt((p-hub)/max(0.01,visibility),25.0)*visibility;
    ink=label+ink*(1.0-label.a);
  }
  alpha=max(alpha,clamp(max(light.r,max(light.g,light.b)),0.0,1.0));
  half4 result=half4(min(light,float3(alpha)),alpha);
  result=panels+result*(1.0-panels.a);
  return ink+result*(1.0-ink.a);
}`;

// The exact material used by talk.mdx's "Change the focus" slide.
// Its Gaussian blur and deformation share one host-owned playback tween.
export const foundationsRippleShader = liquidGlassShader;

export const frameCursorShader = `
uniform shader labels;
uniform float padding;
uniform float time;
uniform float stepIndex;
${geometry}
half4 main(float2 p) {
  p -= float2(padding);
  if(stepIndex<5.0) return half4(0);
  float2 hub=float2(848,330);
  float morph=smoothstep(3.0,4.5,time);
  float charge=smoothstep(0.65,1.15,time);
  float typed=clamp(floor((time-5.1)*14.0),0.0,${command.length}.0);
  float cell=${atlas.cell.toFixed(6)};
  // The cursor forms at the center; the typed prefix grows around that center.
  float left=848.0-cell*typed*0.5;
  float2 cursor=float2(848.0+typed*cell*0.5,330.0);
  float d=mix(length(p-cursor)-25.0,box(p-cursor,float2(2.5,35.0),1.5),morph);
  float glow=exp(-abs(d)*(0.10+morph*0.15))*charge;
  float core=(1.0-smoothstep(-1.0,1.0,d))*charge;
  float3 light=float3(0.55,0.9,1.0)*(glow*0.7+core);
  float burst=max(0.0,time-1.12);
  float flash=exp(-pow((time-1.3)*6.0,2.0));
  light+=float3(0.55,0.88,1.0)*exp(-length(p-hub)*0.006)*flash*5.0;
  float shockRadius=burst*750.0;
  float shock=exp(-pow((length(p-hub)-shockRadius)/24.0,2.0));
  light+=float3(0.24,0.75,1.0)*shock*exp(-burst*1.1)*charge*(1.0-morph);
  for(int i=0;i<96;i++) {
    float id=float(i);
    float angle=id*2.39996;
    float expansion=1.0-exp(-burst*3.0);
    float radius=expansion*(180.0+mod(id*17.0,67.0)*9.0);
    float2 destination=hub+float2(cos(angle),sin(angle))*radius;
    float2 point=mix(destination,cursor,morph);
    float size=2.0+mod(id,4.0);
    float spark=exp(-length(p-point)/size);
    float trail=exp(-segment(p,point,mix(hub,point,0.86))/1.8);
    light+=float3(0.38,0.8,1.0)*(spark*2.4+trail*0.45)*(1.0-morph)*charge;
  }
  float alpha=clamp(max(light.r,max(light.g,light.b)),0.0,1.0);
  half4 result=half4(min(light,float3(alpha)),alpha);
  if(abs(p.y-330.0)<49.0 && p.x>=left && p.x<left+typed*cell) {
    half4 text=labels.eval(float2(p.x-left+800.0-cell*${command.length}.0*0.5,p.y-330.0+2650.0));
    result=text+result*(1.0-text.a);
  }
  return result;
}`;
const network = Skia.RuntimeEffect.Make(foundationsNetworkShader);
const ripple = Skia.RuntimeEffect.Make(foundationsRippleShader);
const cursor = Skia.RuntimeEffect.Make(frameCursorShader);
if (!network || !ripple || !cursor) throw new Error("Could not compile the Spark reveal");

// Leave transparent space for the 24px blur kernel, refraction, and panel glow.
// Keep the logical stage fixed; only the raster surface and filter bounds grow.
const canvasPadding = 160;
const canvasWidth = 1696 + canvasPadding * 2;
const canvasHeight = 680 + canvasPadding * 2;

export function DesktopFoundationsJourney({ icon }: { icon: string }) {
  const step = usePresentationValue("stepIndex");
  const featureUniforms = useAnimatedShaderUniforms({ kind: 0, padding: canvasPadding }, 10, { clock: 5 });
  const shippingUniforms = useAnimatedShaderUniforms({ kind: 1, padding: canvasPadding }, 10, { clock: 5 });
  const glass = useLiquidGlassPlayback({ active: step >= 4, width: canvasWidth, height: canvasHeight });
  const cursorUniforms = useAnimatedShaderUniforms({ padding: canvasPadding }, 10, { clock: 5 });
  const image = <ImageShader image={atlas.image} x={0} y={0} width={atlasWidth} height={rows.length * rowHeight} fit="fill" tx="decal" ty="decal" />;
  return <>
    <View style={{ width: 1696, height: 680, marginTop: 36, alignSelf: "center" }}>
      <Canvas accessibilityLabel={step >= 5 ? command : step >= 4 ? publishing.join(", ") : capabilities.join(", ")}
        style={{ position: "absolute", left: -canvasPadding, top: -canvasPadding, width: canvasWidth, height: canvasHeight }}>
        <Group transform={[{ scale: 1 / glass.pixelRatio }]}>
          <Group transform={[{ scale: glass.pixelRatio }]}
            layer={<Paint><RuntimeShader source={ripple!} uniforms={glass.uniforms}><Blur blur={glass.blur} mode="clamp" /></RuntimeShader></Paint>}>
            <Fill><Shader source={network!} uniforms={featureUniforms}>{image}</Shader></Fill>
          </Group>
        </Group>
        <Fill><Shader source={network!} uniforms={shippingUniforms}>{image}</Shader></Fill>
        <Fill><Shader source={cursor!} uniforms={cursorUniforms}>{image}</Shader></Fill>
      </Canvas>
      {step >= 5 && <View style={{ position: "absolute", top: 95, left: 0, width: 1696 }}>
        <FrameTitle icon={icon} revealDelay={7400} />
      </View>}
    </View>
  </>;
}
