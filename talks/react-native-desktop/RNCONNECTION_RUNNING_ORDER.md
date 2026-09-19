# RN Connection running order

39 slides including backups. Timing needs a new rehearsal after expanding the visual comparison.

| Slide | Title |
| --- | --- |
| 1 | React Native is the best way to build desktop apps |
| 2 | Apps I wanted to exist |
| 3 | Fast to open · Fast to use |
| 4 | Measure what the user sees |
| 5 | Hello World · first content |
| 6 | Hello World · installed size |
| 7 | Hello World · memory |
| 8 | But hello world isn’t a real app. |
| 9 | I built a chat history app. |
| 10 | Then I built it nine times. |
| 11 | Same app. Nine implementations. — 21 manual steps |
| 12 | Chat History · first content |
| 13 | Chat History · memory |
| 14 | Chat History · jump to top |
| 15 | Chat History · switch conversation |
| 16 | Chat History · app size |
| 17 | The combination matters |
| 18 | You can have all three |
| 19 | React composes a native app |
| 20 | Keep the big data native |
| 21 | No WebView required |
| 22 | Native behavior |
| 23 | And then you get React |
| 24 | React Native everywhere |
| 25 | Bring the ecosystem |
| 26 | A desktop app needs more |
| 27 | Introducing Legend Framework |
| 28 | From development to shipping |
| 29 | Desktop tools for React |
| 30 | Early · Useful · Growing |
| 31 | One more app |
| 32 | Legend Slides |
| 33 | Legend Slides · 0.0.1 |
| 34 | Build for desktop |
| 35 | A first choice for desktop |
| 36 | What we measured |
| 37 | Native content ≠ native window |
| 38 | Legend Markdown |
| 39 | The full comparison |

## Media and release preparation

Hello-world startup, installed size, and memory come first. The explicit bridge
“But hello world isn’t a real app” introduces the Chat History hero → grid → tour.

The tour is controlled entirely by presentation steps, with no autoplay:
React Native → AppKit → SwiftUI → Electron → Tauri → Deno → Flutter → Compose → GPUI.
RN, Electron, and Flutter each get sidebar and composer close-ups, then zoom out.
GPUI ends the tour: overview → composer → authored fake-glass overlay → full-slide
takeover. Its newer native composer is acknowledged; the joke is not attributed
to GPUI's implementation. Next advance starts the Chat History results.

RN occupies the top-left grid slot and starts at the left of the carousel.
The featured card is largest and stacks above its neighbors. Back retraces the
21 states. Previews hold their selected state; interpolation runs on the UI thread.

Media remains explicitly labeled as pending. Add matching screenshots to the map
in `NineApps.tsx`; tune normalized sidebar/composer crops in `NineAppsTour.ts`.
Supply one RN video and nine screenshots. Use a consistent Deno WebView capture;
the performance charts still distinguish Deno WebView and CEF and do not include
Compose measurements. Do not imply the visual lineup exactly matches the measured
nine. Native screenshots should show the actual OS sidebar/composer material.
Video playback remains unwired until the clip arrives.

The 0.0.1 announcement is planned launch copy. Verify public release availability
and GitHub destinations before presenting; the speaker notes mark this dependency.
Windows status and public SDK availability must be refreshed before the talk.

Benchmark values are copied from the September 17 report into
`rnconnection-assets/benchmarks.json`. All nine chat implementations and nine
greeting implementations are retained. Size and timing revisions are labeled
separately. The report snapshot is included beside the data; the old deck and its
benchmark.ts are not dependencies.

## Validation

- Real Legend Slides compiler: 39 slides, zero errors, zero warnings.
- Repository `bun run typecheck`: passed.
- All 39 slides have speaker notes; data includes nine chat and nine greeting apps.
- Native inspection attempted with an app-scoped agent-device session. Snapshot
  and screenshot requests timed out; no native visual or navigation verification
  is claimed. Rehearse the actual app before presenting.

September 18: excluded Legend Shell as a duplicate RN host. The original report
snapshot preserves provenance; presentation data uses nine frameworks. RN Hello
World size is now 7.2 MiB after the September 18 optimized ARM64 rebuild
(7,499,962 bytes; symbol stripping, dead-code stripping, ThinLTO, and -Oz). Timing/memory retain the original controlled run; the original
report snapshot is archived evidence. Timing/memory have not been replaced by the later RN-only checks. Both existing RN binaries were verified ARM64-only.

Chat History's size chart uses app-bundle bytes only, excluding external grammar
packs for every framework. All nine current bundles were remeasured; exact bytes
and build dates are in `rnconnection-assets/chat-installed-sizes.json` (the chart
uses `appBytes`, not `combinedInstalledBytes`). RN is 17.8 MiB app-only. Separate
grammars remain recorded for provenance but are not plotted. Performance
measurements are unchanged.
