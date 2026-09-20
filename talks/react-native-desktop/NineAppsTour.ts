import { appOrder, filmstripLeft, type AppId } from "./NineAppsGeometry";

export type Detail = "app" | "sidebar" | "composer" | "takeover";
export type TourStep = { app: AppId; detail: Detail };
export const tourSteps: readonly TourStep[] = [
  { app: "react-native", detail: "app" },
  { app: "react-native", detail: "sidebar" },
  { app: "react-native", detail: "composer" },
  { app: "react-native", detail: "app" },
  { app: "appkit", detail: "app" },
  { app: "swiftui", detail: "app" },
  { app: "electron", detail: "app" },
  { app: "electron", detail: "sidebar" },
  { app: "electron", detail: "composer" },
  { app: "electron", detail: "app" },
  { app: "tauri", detail: "app" },
  { app: "deno", detail: "app" },
  { app: "flutter", detail: "app" },
  { app: "flutter", detail: "sidebar" },
  { app: "flutter", detail: "composer" },
  { app: "flutter", detail: "app" },
  { app: "compose", detail: "app" },
  { app: "gpui", detail: "app" },
  { app: "gpui", detail: "composer" },
  { app: "gpui", detail: "takeover" },
];
export function tourStep(step: number) { return tourSteps[Math.max(0, Math.min(tourSteps.length - 1, step))]; }
export function renderingGroup(app: AppId) {
  const index = appOrder.indexOf(app);
  return index < 3 ? "Native views" : index < 6 ? "Browser-rendered" : "Canvas-rendered";
}
// Normalized screenshot crops. Tune these per capture when the final media arrives.
export const detailCrops = {
  sidebar: { x: 0.02, y: 0.02, width: 0.26, height: 0.94 },
  composer: { x: 0.30, y: 0.77, width: 0.66, height: 0.21 },
};
export const composerRect = { x: filmstripLeft + 1180 * 0.30, y: 260 + 663.75 * 0.77, width: 1180 * 0.66, height: 663.75 * 0.21 };
export function detailCamera(detail: Detail) {
  if (detail === "app") return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  const crop = detailCrops[detail === "sidebar" ? "sidebar" : "composer"];
  const cx = filmstripLeft + (crop.x + crop.width / 2) * 1180;
  const cy = 260 + (crop.y + crop.height / 2) * 663.75;
  const scale = Math.min(3, 1696 / (crop.width * 1180), 780 / (crop.height * 663.75));
  return { x: (960 - cx) * scale, y: 60 + (540 - cy) * scale, scaleX: scale, scaleY: scale };
}
