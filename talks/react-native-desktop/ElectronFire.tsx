import { Flames, FallingSprites } from "slides:materials/Fire";
// @ts-ignore Local emoji texture resolves to a file URL.
import poopAsset from "./rnconnection-assets/poop.png";
export function ElectronFire({ layer, ...props }: { width: number; barHeight: number; x: number; y: number; layer: "flames" | "drops" }) {
  return layer === "flames" ? <Flames {...props} accessibilityLabel="Flames above Electron" />
    : <FallingSprites {...props} sprite={poopAsset} accessibilityLabel="Poop emojis falling to the bottom and bursting into smaller poop emojis" />;
}
