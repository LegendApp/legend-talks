import { carouselCardLayout, type SceneMode } from "slides:media/CarouselGeometry";
export type { SceneMode } from "slides:media/CarouselGeometry";
export const appOrder = ["react-native", "appkit", "swiftui", "electron", "tauri", "deno", "flutter", "compose", "gpui"] as const;
export type AppId = typeof appOrder[number];
export const filmstripCenterX = 960;
export const filmstripWidth = 1560;
export const filmstripLeft = filmstripCenterX - filmstripWidth / 2;
export function appCardLayout(index: number, mode: SceneMode, position = 0, width = filmstripWidth) {
  return carouselCardLayout(index, mode, position, width, { count: appOrder.length });
}
