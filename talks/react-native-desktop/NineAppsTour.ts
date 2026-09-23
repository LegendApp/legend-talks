import { appOrder, filmstripLeft, filmstripWidth, type AppId } from "./NineAppsGeometry";

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
// Normalized recording crops. Electron, Flutter and GPUI share these composer bounds.
export const detailCrops = {
  sidebar: { x: 0.02, y: 0.02, width: 0.26, height: 0.50 },
  composer: { x: 698 / 2560, y: 1208 / 1440, width: 1684 / 2560, height: 120 / 1440 },
};
const videoHeight = filmstripWidth * 0.5625;
const videoTop = 555 - filmstripWidth * 0.625 / 2 + filmstripWidth * 0.0625;
// Measured composer bounds in the borderless 2560 × 1440 GPUI recording.
const mediaHeight = videoHeight;
const mediaWidth = mediaHeight * 16 / 9;
const mediaLeft = filmstripLeft + (filmstripWidth - mediaWidth) / 2;
export const composerRect = {
  x: mediaLeft + 698 / 2560 * mediaWidth,
  y: videoTop + 1208 / 1440 * mediaHeight,
  width: 1684 / 2560 * mediaWidth,
  height: 120 / 1440 * mediaHeight,
  radius: 50 / 2560 * mediaWidth,
};
export function takeoverComposerRect() {
  const camera = detailCamera("composer", "gpui");
  return {
    x: 960 + (composerRect.x - 960) * camera.scaleX + camera.x,
    y: 540 + (composerRect.y - 540) * camera.scaleY + camera.y,
    width: composerRect.width * camera.scaleX,
    height: composerRect.height * camera.scaleY,
    radius: composerRect.radius * camera.scaleX,
  };
}
// Capture-specific targets: show the upper sidebar at reading size, and center
// the actual composer rather than the larger placeholder region.
const reactNativeCrops = {
  sidebar: { x: 0.005, y: 0.035, width: 0.21, height: 0.50 },
  composer: { x: 0.265, y: 0.885, width: 0.675, height: 0.09 },
};
export function detailCamera(detail: Detail, app?: AppId) {
  if (detail === "app") return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  const crops = app === "react-native" ? reactNativeCrops : detailCrops;
  const crop = crops[detail === "sidebar" ? "sidebar" : "composer"];
  const cx = filmstripLeft + (crop.x + crop.width / 2) * filmstripWidth;
  const cy = videoTop + (crop.y + crop.height / 2) * videoHeight;
  const scale = Math.min(3, 1696 / (crop.width * filmstripWidth), 780 / (crop.height * videoHeight));
  return { x: (960 - cx) * scale, y: (540 - cy) * scale, scaleX: scale, scaleY: scale };
}
