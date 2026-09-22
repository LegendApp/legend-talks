import { Background } from "@legend-apps/presentation";
import { AnimatedAtmosphere } from "./packs/backgrounds";

export function DeckBackground({ speed = 0.6 }: { speed?: number } = {}) {
  return <Background priority={-1}>
    <AnimatedAtmosphere variant="droplets" brightness={0.7} speed={speed} />
  </Background>;
}
