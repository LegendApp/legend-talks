import { Canvas, Path } from "@shopify/react-native-skia";

const globe = "M22 12A10 10 0 1 1 2 12A10 10 0 1 1 22 12Z M12 2C6.8 7.2 6.8 16.8 12 22C17.2 16.8 17.2 7.2 12 2Z M2 12H22";

export function WebsiteIcon({ size = 72 }: { size?: number }) {
  return <Canvas accessible={false} pointerEvents="none" style={{ width: size, height: size }}>
    <Path path={globe} color="#68ddff" style="stroke" strokeWidth={1.7}
      strokeCap="round" strokeJoin="round" transform={[{ scale: size / 24 }]} />
  </Canvas>;
}
