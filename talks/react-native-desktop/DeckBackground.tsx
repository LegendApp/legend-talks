import { Background } from "@legend-apps/presentation";
import { Droplets } from "slides:backgrounds/Droplets";

export function DeckBackground({ speed = 0.6 }: { speed?: number } = {}) {
  return <Background priority={-1}>
    <Droplets brightness={0.7} speed={speed} />
  </Background>;
}
