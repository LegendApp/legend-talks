import { Background } from "@legend-apps/presentation";
import { AnimatedAtmosphere } from "./packs/backgrounds";

export function DeckBackground() {
  return <Background priority={-1}>
    <AnimatedAtmosphere variant="droplets" brightness={0.7} speed={0.6} />
  </Background>;
}
