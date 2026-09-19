# RN Connection running order

46 slides: 42 main-talk slides and four optional backups. Timings are deliberately
unset until rehearsal; the expanded story and 21-step visual tour need a fresh pace check.

## Story

Discovery while testing Legend List → Photos and Music → the compromise objection →
Chat History, Code and Diff on shared foundations → rendering primer → Hello World →
real-app visual tour and measurements → technical verdict → React Native everywhere →
three objections → Expo Desktop → Legend Frame → Slides 0.0.1 → ecosystem invitation.

The technical thesis stands separately from familiarity: among the cross-platform
approaches tested on macOS, React Native offers the best overall combination of
speed, memory efficiency and native content UI. AppKit's individual wins remain visible.

| Slide | Title |
| --- | --- |
| 1 | React Native is the best way to build desktop apps |
| 2 | I came here to test a list. → I found a whole platform. — 2 steps |
| 3 | Then I made apps I wanted. |
| 4 | “React Native is a compromise.” |
| 5 | So I kept building. |
| 6 | Different apps. Shared foundations. |
| 7 | Was I just imagining it? → So I measured it. — 2 steps |
| 8 | Three ways to draw a desktop app |
| 9 | Measure what the user sees |
| 10 | Hello World · first content |
| 11 | Hello World · installed size |
| 12 | Hello World · memory |
| 13 | But hello world isn’t a real app. |
| 14 | I built a chat history app. |
| 15 | Then I built it nine times. |
| 16 | Same app. Nine implementations. — 21 manual steps |
| 17 | Chat History · first content |
| 18 | Chat History · memory |
| 19 | Chat History · jump to top |
| 20 | Chat History · switch conversation |
| 21 | Chat History · app size |
| 22 | The combination matters |
| 23 | You can have all three |
| 24 | React composes a native app |
| 25 | Keep the big data native |
| 26 | No WebView required |
| 27 | Native behavior |
| 28 | And then you get React |
| 29 | React Native everywhere |
| 30 | Three objections — one quote per step |
| 31 | That last one is fixable. |
| 32 | Built on Expo Desktop |
| 33 | Legend Frame → Electron’s ambition. React Native’s foundation. — 2 steps |
| 34 | From development to shipping |
| 35 | Desktop tools for React |
| 36 | Early · Useful · Growing |
| 37 | One more app |
| 38 | Legend Slides |
| 39 | Legend Slides · 0.0.1 |
| 40 | Now I need help with the ecosystem. |
| 41 | Does your library support desktop? → macOS + Windows — 2 steps |
| 42 | A first choice for desktop |
| 43 | What we measured |
| 44 | Native content ≠ native window |
| 45 | Legend Markdown |
| 46 | The full comparison |

## Media and release preparation

Hello-world startup, installed size, and memory come first. The explicit bridge
“But hello world isn’t a real app” introduces the Chat History hero → grid → tour.

The tour is controlled entirely by presentation steps, with no autoplay:
React Native → AppKit → SwiftUI → Electron → Tauri → Deno → Flutter → Compose → GPUI.
RN, Electron, and Flutter each get sidebar and composer close-ups, then zoom out.
GPUI ends the tour: overview → composer → authored fake-glass overlay → full-slide
takeover. The custom native composer overlay has been removed; use new captures
showing GPUI's own translucent composer. The joke is not a stock GPUI effect. Next advance starts the Chat History results.

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

- Real Legend Slides compiler: 46 slides, zero errors, zero warnings.
- Repository `bun run typecheck`: passed.
- Every slide has speaker notes. Story and benchmark ordering checked.
- Native visual and navigation verification remains outstanding.

September 18: excluded Legend Shell as a duplicate RN host. The original report
snapshot preserves provenance; presentation data uses nine frameworks. RN Hello
World size is now 7.2 MiB after the September 18 optimized ARM64 rebuild
(7,499,962 bytes; symbol stripping, dead-code stripping, ThinLTO, and -Oz). Timing/memory retain the original controlled run; the original
report snapshot is archived evidence. Timing/memory have not been replaced by the later RN-only checks. Both existing RN binaries were verified ARM64-only.

Chat History's size chart uses app-bundle bytes only, excluding external grammar
packs for every framework. All nine bundles were measured on September 18, before the GPUI/Flutter native-layer removals; new sizes are pending. Historical exact bytes
and build dates are in `rnconnection-assets/chat-installed-sizes.json` (the chart
uses `appBytes`, not `combinedInstalledBytes`). RN is 17.8 MiB app-only. Separate
grammars remain recorded for provenance but are not plotted. Performance
measurements are unchanged.

Opening footage also needs Photos and Music, followed by Chat History, Code and Diff.
Compatibility copy is a local integration snapshot, not a completed library audit.
Expo-shaped adapters are subsets; Margelo Runtimes uses pinned patches. Refresh
release and library status before presenting. The framework is now named Legend Frame.

## Visual storytelling pass

Text cards have been removed. Discovery, measurement, the framework reveal and
maintainer invitation use two deliberate typography steps. The three objections
appear one at a time. Speaker notes retain the detailed qualifications.

Shared foundations: three real app icons → connections → capability names.
Rendering primer: three matching windows progressively reveal platform controls,
browser content and a drawing surface. Labels identify these as schematic models.
Expo Desktop: mobile/web → desktop targets → Frame capabilities. Compatibility:
one sparse status row per step. These four diagrams each have three steps.

The release slide uses the real Slides icon, version and GitHub destination.
Other short flows use typography and arrows without decorative window glyphs.
All new interpolation uses host SceneMotionView on the UI thread; preview states
are static and reverse navigation uses the same step targets. Native visual review
remains outstanding because another task owns the active macOS automation session.
