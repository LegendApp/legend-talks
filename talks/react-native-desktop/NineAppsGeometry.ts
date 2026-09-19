export const appOrder = ["react-native", "appkit", "swiftui", "electron", "tauri", "deno", "compose", "flutter", "gpui"] as const;
export type AppId = typeof appOrder[number];
export type SceneMode = "hero" | "grid" | "filmstrip";
export function appCardLayout(index: number, mode: SceneMode, position = 0) {
  if (mode === "hero") return { x: 960, y: 560, width: 1160, opacity: 1, depth: index === 0 ? 100 : 9 - index };
  if (mode === "grid") {
    const slot = index;
    return { x: 960 + (slot % 3 - 1) * 440, y: 550 + (Math.floor(slot / 3) - 1) * 265, width: 380, opacity: 1, depth: 10 };
  }
  const distance = index - Math.max(0, Math.min(appOrder.length - 1, position));
  const magnitude = Math.abs(distance);
  const scale = 1 - 0.38 * Math.min(1, magnitude) - 0.1 * Math.min(1, Math.max(0, magnitude - 1));
  return { x: 702 + distance * 900, y: 555, width: 1180 * scale,
    opacity: magnitude < 1 ? 1 - magnitude * 0.3 : Math.max(0.25, 0.7 - (magnitude - 1) * 0.2),
    depth: Math.round(100 - magnitude * 10) };
}
