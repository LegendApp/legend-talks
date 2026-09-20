import { FilmstripMotionView, usePresentationValue } from "@legend-apps/presentation";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { appCardLayout, type SceneMode } from "./NineAppsGeometry";
import { MediaSlot } from "./RNConnectionVisuals";
import { MovingTitle } from "./MovingTitle";

type CardLayout = ReturnType<typeof appCardLayout> & { height: number; captionHeight: number };

/** Shared step-controlled carousel; interpolation and exit motion run on the UI thread. */
export function AppCarousel<T extends string>({ items, position, mode = "filmstrip", centered = false, renderCard }: {
  items: readonly T[];
  position: number;
  mode?: SceneMode;
  centered?: boolean;
  renderCard: (id: T, layout: CardLayout) => ReactNode;
}) {
  return <>{items.map((id, index) => {
    const layout = appCardLayout(index, mode);
    // The comparison starts at x=702; app demos center on the 1920px stage.
    const card = { ...layout, x: layout.x + (centered && mode === "filmstrip" ? 960 - 702 : 0) };
    const height = card.width * 0.625;
    return <FilmstripMotionView key={id} index={index} count={items.length} enabled={mode === "filmstrip"} position={position}
      style={{ position: "absolute", left: card.x - card.width / 2, top: card.y - height / 2,
        width: card.width, height, zIndex: card.depth }}>
      {renderCard(id, { ...card, height, captionHeight: card.width * 0.0625 })}
    </FilmstripMotionView>;
  })}</>;
}

export function AppShowcase({ apps, title }: { apps: string[]; title: string }) {
  const step = usePresentationValue("stepIndex");
  return <View style={{ width: 1920, height: 1080, overflow: "hidden" }}>
    <MovingTitle style={{ position: "absolute", left: 112, top: 65, width: 1696, zIndex: 2000 }}>
      <Text style={{ color: "#f8fafc", fontSize: 64, fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </MovingTitle>
    <AppCarousel items={apps} position={step} centered renderCard={(name, card) => <MediaSlot label={name} height={card.height} />} />
  </View>;
}
