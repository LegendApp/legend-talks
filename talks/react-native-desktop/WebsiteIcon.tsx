import { Canvas, Path } from "@shopify/react-native-skia";

const globe = "M22 12A10 10 0 1 1 2 12A10 10 0 1 1 22 12Z "
  + "M12 2A5 10 0 1 0 12 22A5 10 0 1 0 12 2Z M12 2V22 "
  + "M3.34 7H20.66 M2 12H22 M3.34 17H20.66";

export function WebsiteIcon({ size = 72 }: { size?: number }) {
  return <Canvas accessible={false} pointerEvents="none" style={{ width: size, height: size }}>
    <Path path={globe} color="#68ddff" style="stroke" strokeWidth={1.2}
      strokeCap="round" strokeJoin="round" transform={[{ scale: size / 24 }]} />
  </Canvas>;
}
