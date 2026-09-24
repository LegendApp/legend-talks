# RN Connection running order

54 slides: 45 main-talk slides, four optional backups, and five TypeGPU alternates. Timings are deliberately
unset until rehearsal; the expanded story and 20-step visual tour need a fresh pace check.

## Story

Discovery while testing Legend List → Photos and Music → tweeting about the Electron comparison → “Native would be faster” → the compromise objection →
Chat History, Code and Diff on shared foundations → rendering primer → Hello World →
real-app visual tour and measurements → technical verdict → React Native everywhere →
three objections → Expo Desktop → Legend Spark → Slides 0.0.1 → ecosystem invitation.

The technical thesis stands separately from familiarity: among the cross-platform
approaches tested on macOS, React Native offers the best overall combination of
speed, memory efficiency and native content UI. AppKit's individual wins remain visible.

| Slide | Title |
| --- | --- |
| 1 | React Native is the best way to build desktop apps |
| 2 | I came here to test LegendList → I found an incredible platform — 2 steps |
| 3 | Then I made apps I wanted |
| 4 | “Native would be faster” |
| 5 | “React Native is a compromise” |
| 6 | So I kept building |
| 7 | Different apps. Shared foundations. |
| 8 | Was I just imagining it? → So I measured it — 2 steps |
| 9 | Three ways to draw a desktop app |
| 10 | Measure what the user sees |
| 11 | Hello World · first content |
| 12 | Hello World · installed size |
| 13 | Hello World · memory |
| 14 | But hello world isn’t a real app |
| 15 | I built a chat history app |
| 16 | Then I built it nine times |
| 17 | Same app. Nine implementations. — 20 manual steps |
| 18 | Chat History · first content |
| 19 | Chat History · memory |
| 20 | Chat History · jump to top |
| 21 | Chat History · switch conversation |
| 22 | Chat History · app size |
| 23 | In the leading group on every metric — overview, then highlight RN |
| 24 | The combination matters |
| 25 | You can have all three |
| 26 | React composes a native app |
| 27 | Keep the big data native |
| 28 | No WebView required |
| 29 | Native behavior |
| 30 | And then you get React |
| 31 | React Native everywhere |
| 32 | What’s holding desktop back — three boxes, then strike Performance |
| 33 | That last one is fixable |
| 34 | Built on Expo Desktop |
| 35 | Legend Spark → Electron’s ambition. React Native’s foundation. — 2 steps |
| 36 | From development to shipping |
| 37 | Desktop tools for React |
| 38 | Early · Useful · Growing |
| 39 | One more app |
| 40 | Legend Slides |
| 41 | Legend Slides · 0.0.1 |
| 42 | One box left — strike desktop modules, then zoom into existing modules |
| 43 | Now I need help with the ecosystem |
| 44 | Does your library support desktop? → macOS + Windows — 2 steps |
| 45 | A first choice for desktop |
| 46 | What we measured |
| 47 | Native content ≠ native window |
| 48 | Legend Markdown |
| 49 | The full comparison |

## Media and release preparation

Hello-world startup, installed size, and memory come first. The explicit bridge
“But hello world isn’t a real app” introduces the Chat History hero → grid → tour.

The tour is controlled entirely by presentation steps, with no autoplay:
React Native → AppKit → SwiftUI → Electron → Tauri → Deno → Flutter → Compose → GPUI.
RN, Electron, and Flutter each get sidebar and composer close-ups, then zoom out.
GPUI ends the tour: overview → composer → one continuous ripple fade and full-slide
takeover. The custom native composer overlay has been removed; use new captures
showing GPUI's own translucent composer. The joke is not a stock GPUI effect. Next advance starts the Chat History results.

RN occupies the top-left grid slot and starts at the left of the carousel.
The featured card is largest and stacks above its neighbors. Back retraces the
20 states. Previews hold their selected state; interpolation runs on the UI thread.

Media remains explicitly labeled as pending. Add matching screenshots to the map
in `NineApps.tsx`; tune normalized sidebar/composer crops in `NineAppsTour.ts`.
Supply one RN video and nine screenshots. Use a consistent Deno WebView capture;
the performance charts still distinguish Deno WebView and CEF and do not include
Compose measurements. The new four-metric overview includes Compose and the September 19 RN update, explicitly labeled as mixed dates/builds. Do not imply the visual lineup exactly matches the measured
nine. Native screenshots should show the actual OS sidebar/composer material.
Video playback remains unwired until the clip arrives.

The 0.0.1 announcement is planned launch copy. Verify public release availability
and GitHub destinations before presenting; this is a production prerequisite for the spoken launch copy.
Windows status and public SDK availability must be refreshed before the talk.

Benchmark values are copied from the September 17 report into
`rnconnection-assets/benchmarks.json`. All nine chat implementations and nine
greeting implementations are retained. Size and timing revisions are labeled
separately. The report snapshot is included beside the data; the old deck and its
benchmark.ts are not dependencies.

## Validation

- Real Legend Slides compiler: 52 slides, zero errors, zero warnings.
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
release and library status before presenting. The framework is now named Legend Spark.

## Visual storytelling pass

Text cards have been removed. Discovery, measurement, the framework reveal and
maintainer invitation use two deliberate typography steps. The three objections appear together; Performance is crossed out on step two. Speaker notes retain the detailed qualifications.

Shared foundations: Music, Chat History, Code, Diff and Markdown → sculpted roots and native capabilities (two steps).
Rendering primer: three matching windows progressively reveal platform controls,
browser content and a drawing surface. Labels identify these as schematic models.
Expo Desktop: mobile/web → desktop targets → Spark capabilities. Compatibility:
one sparse status row per step. The rendering, Expo Desktop and compatibility diagrams each have three steps.

The release slide uses the real Slides icon, version and GitHub destination.
Other short flows use typography and arrows without decorative window glyphs.
All new interpolation uses host SceneMotionView on the UI thread; preview states
are static and reverse navigation uses the same step targets. Native visual review
remains outstanding because another task owns the active macOS automation session.

## Chart continuity

All benchmark charts share a 1696 × 710 layout, 34-point labels and values,
43-point rows and 30-point bars. Full charts use the same row spacing and origin;
installed-size grouping retains its focused arrangements inside that same frame.
Framework names identify sibling shared label, bar and value elements across
metrics. Text translates without stretching; bars interpolate width and vertical
position together. Unmatched chart entrances still grow from zero. Metric axes
remain independently scaled, and the Hello World size chart retains 0–320 MiB.

Shared transitions now use the native animation driver. Within-slide group
rearrangements use a host UI-thread position component whose destination remains
measurable for the next shared transition. Geometry regression tests cover label
proportions, fixed bar origins, width interpolation and row movement. Native
visual verification remains pending; the active macOS session belongs to another task.

The Chat History hero/grid/tour titles and tour subtitle remain centered. The
TypeGPU glass builds from clear to exaggerated ripples inside the composer for
five seconds, then expands across the slide over eight seconds. Both phases run
on one advance, without a caption.

The shared foundation is now a live Skia glass-root sculpture with a braided
trunk. A UI-thread clock drives shader-only thickness and brightness pulses;
previews hold a fixed time and inactive slides stop advancing. Ten readable
capability labels occupy two rows outside the shader. Music uses a temporary
note symbol; Markdown uses the local folded-M icon. Native whole-slide visual
verification is pending. The SkSL was compiled and rendered with CanvasKit.

### Three-box callback

Before the framework: show Performance / Existing modules / Desktop modules, then strike Performance on the second step. After the framework and Slides reveal: return with Performance checked, shatter Desktop modules into a green check on step two, then zoom into Existing modules on step three to introduce the ecosystem audit and maintainer invitation. Cross-outs mean the demonstrated concern has an answer, not universal performance wins or complete API parity.


## TypeGPU alternates

The original main talk and backups remain intact. Slides 48–52 are comparison
variants, not part of the rehearsed running order:

| Slide | Alternate |
| --- | --- |
| 50 | Shared foundations: 2,048 GPU particles travel through the roots |
| 51 | Three rendering styles: perspective glass windows and dimensional controls |
| 52 | Glass takeover: measured composer bounds expand over a captured chat with frosting and edge refraction |
| 53 | Existing modules: 256-node illustrative library constellation |
| 54 | Background: 16 interacting droplets with persistent GPU state |

Except for the Skia capture-based glass takeover, these use TypeGPU for typed shader composition and uniform layout, and a new
host-compiled UI-thread WebGPU path for frame submission and compute dispatch.
The older TypeGPU host still uses a JS frame loop; these slides do not use it.
Previews render a deterministic still. Outgoing views hold their last frame;
prepared slides do not submit frames. The background follows viewport size and
the Appearance intensity setting.

The droplet simulation uses ping-pong storage buffers with repulsion and wall
bounces. The glass takeover samples the paused chat using a Skia shader and the shared step clock; it is a presentation effect, not the OS material. The
constellation does not represent audited library compatibility. The windows
are shader illustrations, not actual native widgets.

Validation: deck compilation, TypeScript, host React compiler/worklet transform,
lifecycle tests, and individual Metal/WebGPU shader renders. Native Slides
navigation and visual verification remain outstanding.


## Speaker-note voice pass

The spoken draft now follows the comment style in the two Chain React 2026
versions, with App.js 2026 and Jay's opening/closing sections of the React Native
London 2025 desktop talk as additional references: short spoken paragraphs,
concrete examples, direct first-person claims, occasional dry humor, and numbered
cues for reveals. The audience content and slide order have not changed.

The 20-step app tour has one-based cues matching its actual camera sequence.
The three-box story crosses out Performance before the framework section,
then New modules on the return, then focuses Existing modules for the audience.
The five TypeGPU alternates have replacement narration rather than renderer
implementation instructions.

Keep production checks out of the main spoken script: supply the remaining app
footage, replace schematic captures, refresh GPUI/Flutter assets and sizes,
confirm public 0.0.1 availability and GitHub destinations, and refresh platform
and library-support statuses. The current notes are launch-day rehearsal copy,
not evidence that these pending tasks have been completed.
