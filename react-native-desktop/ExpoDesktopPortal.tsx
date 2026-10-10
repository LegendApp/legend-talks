import { portalProgram, portalParticles } from "./ExpoDesktopPortalGPU";
import { GitHubLink } from "./GitHubLink";
import { Canvas, Path } from "@shopify/react-native-skia";
import { GPUShader } from "@legend-apps/presentation";
import { Text, View } from "react-native";

const expoLogo = "M0 20.084c.043.53.23 1.063.718 1.778.58.849 1.576 1.315 2.303.567.49-.505 5.794-9.776 8.35-13.29a.761.761 0 011.248 0c2.556 3.514 7.86 12.785 8.35 13.29.727.748 1.723.282 2.303-.567.57-.835.728-1.42.728-2.046 0-.426-8.26-15.798-9.092-17.078-.8-1.23-1.044-1.498-2.397-1.542h-1.032c-1.353.044-1.597.311-2.398 1.542C8.267 3.991.33 18.758 0 19.77Z";


export function ExpoDesktopPortal() {
  return <View style={{ width: 1696, height: 900, alignSelf: "center" }}>
    <Text style={{ color: "white", fontSize: 88, fontWeight: "600", textAlign: "center", marginTop: 12 }}>Expo Desktop</Text>
    <View style={{ position:"absolute",top:105,left:0,width:1696,height:650 }}>
      <GPUShader code={portalProgram} particles particleCount={portalParticles} composite width={1696} height={650} clock="slide" previewTime={3.5} borderRadius={0} />
    </View>
    <Canvas accessibilityLabel="A glowing glass portal refracts particles flowing from Expo to macOS and Windows" style={{ position: "absolute", top: 105, left: 0, width: 1696, height: 650 }}>

      <Path path={expoLogo} color="white" transform={[{ translateX: 182 }, { translateY: 272 }, { scale: 5.5 }]} />
      <Path path="M0 0H40V40H0ZM48 0H88V40H48ZM0 48H40V88H0ZM48 48H88V88H48Z" color="white" transform={[{ translateX: 1390 }, { translateY: 285 }, { scale: 1.2 }]} />
    </Canvas>
    <Text style={{ position: "absolute", left: 1190, top: 344, fontSize: 143, color: "white", fontFamily: "Helvetica Neue" }}></Text>
    <GitHubLink repository="shirakaba/expo-desktop" label="Expo Desktop on GitHub" style={{ position: "absolute", top: 772 }} />
  </View>;
}
