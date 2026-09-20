export const platforms = ["iOS", "Android", "macOS", "Windows", "Web"];
// 0 = unavailable, 1 = app target. Half dots mark reusable Web UI or,
// for Tauri mobile, the presenter’s qualified assessment of the experience.
export const frameworkCoverage = [
  { name: "React Native", native: true, coverage: [1, 1, 1, 1, 1] },
  { name: "AppKit", native: true, coverage: [0, 0, 1, 0, 0] },
  { name: "GPUI", native: false, coverage: [0, 0, 1, 1, 0] },
  { name: "SwiftUI", native: true, coverage: [1, 0, 1, 0, 0] },
  { name: "Tauri", native: false, coverage: [0.5, 0.5, 1, 1, 0.5] },
  { name: "Flutter", native: false, coverage: [1, 1, 1, 1, 1] },
  { name: "Compose", native: false, coverage: [1, 1, 1, 1, 1] },
  { name: "Electron", native: false, coverage: [0, 0, 1, 1, 0.5] },
  { name: "Deno", native: false, coverage: [0, 0, 1, 1, 0.5] },
];
