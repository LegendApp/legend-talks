# Chat History reference — September 20, 2026

Mixed-build reference, not a final synchronized benchmark. Supplied by Jay for the deck on September 20. This supersedes the chat timing and memory rows in the bundled historical benchmark report.

Times are video-derived milliseconds. Memory is physical footprint in MiB, measured separately without recording. GPUI and Tauri include new file-backed storage and are single runs. Other affected apps still await completed builds and runtime remeasurement. Their single-run timings cannot establish startup regressions against earlier medians.

| App | Window | First content | Jump | Switch | Initial memory | Top memory | Switched memory | Measurement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| AppKit | 226.9 | 318.9 | 79.1 | 88.3 | 42.4 | 49.0 | 49.0 | September 17 |
| GPUI | 249.7 | 366.4 | 54.9 | 185.0 | 76.2 | 78.3 | 96.7 | New file-backed storage; single run |
| React Native | 235.6 | 393.2 | 50.6 | 183.0 | 54.1 | 58.7 | 66.8 | September 19; 10-run median |
| Tauri | 276.2 | 626.2 | 70.9 | 226.3 | 136.2 | 143.1 | 166.7 | New file-backed storage; single run |
| SwiftUI | 268.7 | 668.8 | 68.9 | 554.6 | 82.6 | 83.4 | 93.2 | September 17 |
| Flutter | 244.3 | 1094.0 | 80.2 | 625.9 | 340.7 | 337.1 | 265.6 | September 17; before storage changes |
| Deno WebView | 419.2 | 1268.9 | 72.9 | 657.0 | 408.1 | 415.7 | 582.4 | September 17; before storage changes |
| Electron | 261.0 | 1277.7 | 70.5 | 679.0 | 477.5 | 476.2 | 445.8 | September 17; before storage changes |
| Compose | 343.6 | 1277.3 | 83.0 | 326.2 | 786.1 | 793.7 | 947.0 | September 18; before storage changes |
| Deno CEF | 310.4 | 1294.4 | 70.5 | 670.1 | 616.9 | 618.0 | 580.8 | September 17; before storage changes |

App-only installed sizes remain the earlier snapshot, excluding external grammar packs. Hello World measurements are unchanged.

Related source documents:
- `chat-history-comparison/docs/REACT_NATIVE_BENCHMARK_RESULTS.md`
- `chat-history-comparison/docs/SOURCE_STORAGE.md`
