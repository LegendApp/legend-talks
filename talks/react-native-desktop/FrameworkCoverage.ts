export const platforms = ["iOS", "Android", "macOS", "Windows", "Web"];
// 0 = unavailable, 0.5 = reusable web UI requiring API adaptation, 1 = app target.
export const frameworkCoverage = [
  { name: "React Native", native: true, coverage: [1, 1, 1, 1, 1] },
  { name: "AppKit", native: true, coverage: [0, 0, 1, 0, 0] },
  { name: "GPUI", native: false, coverage: [0, 0, 1, 1, 0] },
  { name: "SwiftUI", native: true, coverage: [1, 0, 1, 0, 0] },
  { name: "Tauri", native: false, coverage: [1, 1, 1, 1, 0.5] },
  { name: "Flutter", native: false, coverage: [1, 1, 1, 1, 1] },
  { name: "Electron", native: false, coverage: [0, 0, 1, 1, 0.5] },
  { name: "Deno", native: false, coverage: [0, 0, 1, 1, 0.5] },
  { name: "Compose", native: false, coverage: [1, 1, 1, 1, 1] },
];
