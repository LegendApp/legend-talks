# React Conf and RN Connection effect extraction audit

Audited on 2026-10-09 against `legend-talks` source revision
`2591ea85712d68ddac270eae5819e146b89caccd`, together with the current Slides host
and presentation compiler in the sibling `legend-apps` checkout. This is a source
and architecture audit, not a new frame-rate benchmark or an implementation of
downloads. No effects have been moved by this audit.

Both talks live under [talks/react-native-desktop](../talks/react-native-desktop).
The resolved local TS/TSX import graphs, including frontmatter templates and
transitions, contain 82 modules for `reactcon.mdx`, 72 for `rnconnection.mdx`, and
88 unique modules across both. These counts include imported helpers that do not
appear as rendered tags; they do not represent simultaneously mounted effects.
I also inspected the adjacent effect gallery and pack prototypes so an extraction
does not recreate reusable code that already exists.

## Recommended boundary

Keep the existing engine in `legend-apps/packages/presentation`: playback,
step/navigation identity, native motion and keyframes, background ownership,
shared elements, focus/cameras, native video, capture scheduling and bounded
image caches. Keep the generic `Effect`, shader and TypeGPU renderers in Slides.
Those are the execution facilities used by optional packs.

Put the visual implementations in an isolated, app-owned source area such as
`legend-apps/packages/slides-effects/packs/`. Ownership belongs to Slides, but
the app entrypoint must not import a pack catalog or all pack implementations.
The proposed directory is an extraction destination, not an existing resolver.

```text
packages/slides-effects/
  packs/
    typography/    # animated text and text materials
    backgrounds/   # independent atmosphere entrypoints
    materials/     # glass, refraction, strikes and destruction
    presenting/    # attention, comparison, annotations and detail
    charts/        # data-driven charts and performance explanations
    particles/     # trails, emitters and GPU particle reveals
    media/         # carousel, focus blur and recorded-media compositions
    diagrams/      # connections, branches and layer diagrams
    morphs/        # advanced shape/device/content transformations
  test-support/
```

Each family should contain independently addressable entrypoints, a small manifest,
tests and examples. Examples and talk assets should remain outside runtime
entrypoints. Share private helpers within a pack; avoid creating another runtime
or publishing every internal helper as an API. Dependencies between packs should
be explicit and small.

## Best first extractions

| Pack | Existing source | Reusable part | Work before extraction |
| --- | --- | --- | --- |
| Typography | `AnimatedTitle.tsx`, `titleEntrancePresets.ts` | All 16 entrance presets; title, word and letter units; masks; chromatic layers; slide/step timing | Expose sizing/style defaults without imposing the talk's 1696px title width. Preserve settled poses, deterministic previews and outgoing frames. |
| Backgrounds | `packs/backgrounds/` | Aurora, droplets, fluid, smoke, wireframe, glass atmosphere; TypeGPU interacting glass | Split variant entrypoints so importing one does not eagerly compile every shader. Separate generic droplets from the title-specific feed/absorption uniforms. |
| Glass materials | `GlassPanels.tsx`, `BranchMaterial.ts` | Rounded panels, circles, breathing edges, moving highlights; lit connector material | Already mostly parameterized. Preserve one surface for a group of panels and the bounded shader cache. Expose palette and geometry. |
| Presenting | `packs/presenting/` | Measured targets, spotlights, callouts, freeze/annotate, progressive detail, wipe, content swap, exploded layers, code walkthrough | Mostly ready. Separate styling from mechanism; retain scaled target measurement, pointer/accessibility behavior and child playback responsibilities. |
| Destruction/status | `DesktopObjections.tsx`, `SlidesReveal.tsx` | Draw an X, impact flash, shards, sparks, X-to-check morph, image shatter | Separate material/strokes/shatter from objection labels, three-card positions, slide step numbers and the Slides screenshot. Parameterize content bounds, completion state, tint and trigger. |
| Charts | `BenchmarkChart.tsx`, `ChartBar.tsx`, `numberFlowTiming.ts` | Animated rows, textured bars, shared row movement, grouping and number transitions | Remove benchmark JSON, metric names, bucket thresholds and special highlighting of React Native. Take caller-provided data, units, IDs, geometry and grouping. |
| Media | `AppCarousel.tsx`, `FilmstripMotionView.tsx`, `CarouselBlurView.tsx`, `carouselBlurImages.ts` | Filmstrip/grid poses, focus blur, live-to-poster handoff, staggered preparation | `AppCarousel` already takes items/render callbacks but imports `AppShowcase` and its media in the same module. Split them first; remove the `NineAppsGeometry` dependency and fixed 900px spacing. Keep bounded leases/capture scheduling and player continuity. |
| Animation assets | `packs/animation/LottiePlayer.tsx` | Shared-clock Lottie progress, static previews, looping/clamped playback | Split the player from `NativeOrbitLottie` and its JSON/demo chrome. Require the existing host Lottie capability; do not ship another runtime. |

The 16 typography presets are `soft-rise`, `word-lift`, `letter-wave`,
`center-out`, `tracking-collapse`, `split-arrival`, `zipper`, `elastic-drop`,
`hinge`, `spin-in`, `scatter`, `stretch-release`, `typewriter`, `wipe`,
`curtain`, and `chromatic-glitch`.

## Remaining talk effects and animation compositions

These have reusable mechanisms, but their current exports are talk scenes rather
than general-purpose components.

| Source | Extractable mechanism | Keep local / required generalization |
| --- | --- | --- |
| `WaterTitle.tsx`, `TitleByline.tsx`, `titleBubbleSimulation.ts`, `useTitleBubbleSimulation.ts`, `titleDripAnchors.ts`, `bylineDotSources.ts` | Liquid typography, droplets feeding glyphs, absorption/release, cosmic burst, liquid separators | Hardcoded heading, author/company names, selected word/rect, two-line assumptions, 1920×1080 geometry and automatic step advance belong to the talk. Supply text/target spans, author content, stage bounds and triggers. This is an advanced pack, not a generic wrapper yet. |
| `NativeReactions.tsx`, `reactcon-scenes/NativeReactions.tsx` | Letters scatter/morph into a collage of image cards | Supply arbitrary text, destinations, cards and timing. Prefer the React Conf version's actual native glyph measurements over RN Connection's estimated letter widths. Keep the quoted reactions/assets local. |
| `CompromiseQuestion.tsx`, `reactcon-scenes/CompromiseQuestion.tsx` | Measured word rearrangement, replacement and punctuation reveal | Supply tokens and poses; keep the specific sentence local. Share text measurement with typography rather than extracting a compromise-specific component. |
| `ElectronFire.tsx` | Upward fire, falling image/emoji particles, impact splash and accumulation | Split flame and falling-particle exports; supply sprite/tint, emission geometry and floor bounds. Remove Electron naming and the poop asset. Retain the shader's bounds/nearby-row optimizations. |
| `AIMaintenance.tsx` | A branching flow with pulses; repeated particles following paths | Extract a data-driven branch diagram and a trajectory emitter. Platform labels, crying emoji and feature/bug narrative are inputs/examples. |
| `ChatArchitecture.tsx` | Step-emphasized pipeline nodes, glowing connectors and particles | Supply nodes, paths, labels and emphasis. The React/native parser architecture remains local. Imported by both decks but not rendered as a tag in their current MDX. |
| `SharedRoots.tsx`, `FramePitch.tsx` | Merging roots/ribbons, branching connections, delayed text reveal | Supply nodes/edges/labels and use the existing keyframe engine. Legend Spark imports, capabilities and app icons remain local. |
| `ExpoDesktopScene.tsx`, `reactcon-scenes/ExpoDesktopScene.tsx` | Glass node network, connection latch/impact/recoil, pulses and label refraction | Supply node topology, labels/images and connection timing. Remove Expo/platform logos and hardcoded coordinates. Preserve label atlases and bounded fragment evaluation. |
| `DesktopFoundations.tsx`, `reactcon-scenes/DesktopFoundations.tsx` | Network-to-command morph, cursor/typing sequence, label atlas | Generic diagram/typing pieces only. Spark feature lists and command stay local. Reuse host `liquidGlassShader` / `useLiquidGlassPlayback`; that blur/refraction mechanism is already extracted. |
| `ExpoDesktopPortal.tsx` | Glowing portal, refraction and a stream crossing it | Supply entry/exit paths, palette and content. Expo logos, labels and repository link stay local. |
| `EverywhereMorph.tsx` | Phone/tablet/browser/desktop frame morph | Supply screen content, device sequence, bounds and durations. Currently draws a fixed Chat History illustration, not arbitrary child UI. |
| `RendererWindows.tsx`, `FrameworkLanguages.tsx`, `CrossPlatformLanes.tsx`, React Conf lanes variant | Window layering, branches and animated coverage dots | Extract window/layer/connection primitives or a configurable matrix. Framework names, coverage assessments and language comparisons remain local. |
| `BalanceDiagram.tsx` | Animated glass Venn circles, refracted text and curved labels | Supply circles, labels, label arcs and item positions. Existing native/canvas framework classifications remain talk data. |
| `NativeUIMatters.tsx` | Window/menu/media overlays, stage focus and glass shapes | Reuse generic window/attention/media pieces. The macOS integration narrative and recordings remain local. |
| `ComposerGlassTakeover.tsx` | Refraction/dispersion over a live video texture | Supply texture and region/camera geometry. Current coordinates derive from a specific chat composer screenshot and tour. Avoid a second video decoder by retaining shared frame ownership. |
| `FakeGlassTakeover.tsx` | Zoom/expand a simulated glass region | Adjacent helper, not reached by current decks' imports. Reuse material plus camera primitives; remove composer-specific geometry. |
| `ReactNativeTitleDemo.tsx`, React Conf variant | Synchronized typing/code change and window-label change from an atlas | Generalize to caller-provided strings, source and keyframes; no real native window update is performed by this illustrated scene. |
| `SparkAppEditingScreenshots.tsx`, `sparkEditingTimeline.ts` | Screenshot zoom, typed prompt, caret/spinner, before/after fade | Supply screenshots, input/button regions, prompt and timeline. Keep Spark branding and generated example text local. |
| `MeasurementTimeline.tsx` | Click/window/content visual sequence with step emphasis | Configurable illustrated measurement sequence if needed; adjacent imported helper not rendered in either current deck. |
| `SlidesFeatureParticles.ts` | TypeGPU glow/particle field | Move the program with its host frame contract; expose density, palette and bounds. Keep the three-library showcase in `SlidesFeatures` local. |
| `SlidesFeatures.tsx` | Repeated glass tiles on keyframe paths, metaball/material sample | Extract tile-path/field examples only where useful; use existing motion/material packs for the rest. Reanimated/Skia/TypeGPU labels and authoring samples remain local. |
| `MusicSizeReveal.tsx`, `HelloSizeJourney.tsx`, `HelloWorldIntro.tsx`, `PackageDownloadsChart.tsx`, `FrameworkComparison.tsx`, `MetricBuckets.tsx` | Chart compositions, grouping, changing numbers and comparison emphasis | Migrate to reusable chart APIs; keep all benchmark/download/size values, grouping policy, narration and workload labels local. |
| `BenchmarkTitle.tsx`, `MusicPerformance.tsx`, `ModuleCompatibility.tsx`, `StoryDiagrams.tsx`, `reactcon-scenes/StoryScenes.tsx`, `FrameRunnerDemo.tsx` | Title entrances, shared-position headers, fades and retargeted native poses | Compose existing typography/motion primitives. Do not add a pack export for each talk-specific scene. |
| `MovingTitle.tsx`, `TitleTransition.ts`, `reactcon-scenes/Motion.tsx`, `RNConnection.tsx` reveal helper | Shared-title wrapper, fade transition, arrival/fade presets | Very small wrappers over existing host primitives. Replace the `rnconnection-title` ID with caller ownership; title fade belongs in the existing transition library rather than a new rendering subsystem. |
| `LocalRecording.tsx`, `RecordingFrameProvider.tsx`, `NativeMusicRecording.tsx`, `LegendAppVideo.tsx` | Lazy start/poster behavior and shared video frames | Keep video decoding in the host. Move reusable media composition/ownership only; remove HTML-to-video filename assumptions and talk assets. |
| `DirectoryTitle.tsx`, `WebsiteIcon.tsx`, `GitHubLink.tsx`, `RNConnectionVisuals.tsx` | Static logo/icon/media framing | Keep branded drawings and links with talks; optional generic icon/header/media-frame layout could accompany a theme pack if actually reused. |
| `NineApps.tsx`, `NineAppsTour.ts`, talk templates and review frame | Assembly of reusable carousel, media, background and camera behavior | Nine-framework order, crop regions, tour steps, review labels and presentation narrative remain local. Do not move the whole scene into the app. |

## Existing gallery packs: additional extraction candidates

Most of these do not appear in the current talks' import graphs. They are useful
prototypes, not proof of a production-ready API.

| Existing family | Candidates | Readiness |
| --- | --- | --- |
| Distortion | `prismaticTear`, `softRipple`, `distortionTiming` | Shader sources/timing are reusable. Keep the existing host liquid/ripple/glitch/pixelate presets compatible; consolidate duplicated ripple math. |
| Glass | `liquidGlass`, `MaterialSampler` | The shader accepts regions; replace chat-specific region defaults and the escalating-demo timeline. MaterialSampler is a fixed gallery scene rather than arbitrary-content glass. Keep analytic panels and captured/live-texture refraction as distinct materials. |
| GPU data | `gpuConstellation`, `gpuInterfaceReveal`, `sidebarStorm`, `particleFrame` | Reusable shader programs with fixed layouts/counts (1024, 4096 and 384 respectively). Expose geometry/count/duration. Move `particleFrame` beside them; two pack programs currently reach outside `packs/` to import it. |
| GPU backgrounds | `TypeGPUGlassBackground`, `TypeGPUAlternates.ts`, `TypeGPUAlternateLayouts.tsx` | Interacting glass is a good separate entrypoint. Alternate roots/windows/ecosystem/takeover programs are scene-specific alternatives; generalize only the useful visual parts. Keep illustrated layouts with examples. |
| Performance | `LatencyRace`, `MemoryGravity`, `FrameBudget`, `ThreadPressure`, `BenchmarkArrival` | First two already accept comparison values, but still contain Chat History text/default measurements. FrameBudget explicitly labels its illustrative workload. Generalize values/content/labels, preserve measured-vs-illustrative distinction. BenchmarkArrival has hardcoded framework bars. |
| Layers/reveals | `NativeLayerPeel`, `ComponentXRay`, `NativeDataWindow`, `CodeToUI`, `CodeToPixels` | Useful transitions after accepting caller-provided layers, content and destinations. Fixed sample UI is not a reusable live component-tree inspection facility. |
| Comparison/depth | `ChromeConveyor`, `InfiniteDesktop`, `WindowPortal`, `PlatformMetamorphosis` | Extract transforms/frame morphs, then accept arbitrary content. `WindowPortal` is an illustrated window scene, not an actual slide-transition definition. |
| Typography | `ShaderTypography` | Good energy-filled text material; replace hardcoded `NATIVE`, font, dimensions and gallery captions. |
| Motion/interaction | `PhysicsLayout`, `MagneticCursor` | PhysicsLayout uses an analytic damped-spring formula over fixed panels, not a general constraint solver. MagneticCursor follows a scripted orbit, not actual mouse input. Expose data/control values and name/document these accurately. |
| Attention | `FocusSpotlight` | A fixed three-card animated demonstration. Prefer the existing measured `AttentionStage`/`Spotlight` implementation as the public API; retain this as an example/material variant. |
| Automation | `AgentDeviceScan` | A staged illustration with hardcoded Chat History/task rows. A reusable scan overlay is possible; it is not an automation backend. |
| Animation | `NativeOrbitLottie`, `native-orbit.json` | Example/optional asset, separate from the general player. |
| Shared support | `FrameView`, `FrameText`, `FrameLabel`, `FrameShader`, `effectRuntime`, `effectProfile`, presenting `motion`/`geometry` | Pack-private support, built on host playback. Avoid a second public clock API; `useEffectTime$` is an alias, not an observable-driven animation loop. |

## What keeps this small and downloadable later

- Package **source/shaders and declared assets**, compiled by the deck compiler.
  The compiler already runs React Compiler, TypeGPU transformation and worklet
  serialization on imported React source. Packs should use that same path and
  the host's existing React/Reanimated/Skia/WebGPU instances.
- Keep one runtime entry per effect. Avoid a root barrel with eager shader
  compilation, atlas creation or sample imports. `AnimatedAtmosphere` currently
  compiles all variants when its module loads; `LottiePlayer` imports its demo
  JSON; `AppCarousel` imports showcase recordings. These are concrete boundaries
  to fix before distribution.
- A small manifest can declare `id`, `version`, entrypoints, required host API
  version/capabilities, supported renderers/platforms and asset files. Installed
  versions should be pinned by a deck so a future update does not alter a talk.
- The proposed `slides:` import prefix is currently documentation only. The
  compiler accepts whitelisted host modules and local files inside the deck
  directory; copying a pack into `packages/` alone will not make it importable.
  A future resolver needs separate installed-pack roots, pack-relative assets,
  dependency tracking and cache invalidation. Keep current deck containment for
  ordinary local imports.
- Offline playback should use installed/pinned packs; downloading should happen
  before a presentation. Export should include the selected pack dependencies and
  assets. Native and static-web capabilities need separate declarations/fallbacks;
  do not assume macOS Skia/TypeGPU/Lottie code is automatically web-compatible.
- Downloadable source cannot add native modules to a running app. Lottie,
  Reanimated, Skia and WebGPU capabilities already exist in the native host.
  A pack needing another native runtime must declare that requirement rather
  than bundle a duplicate runtime.

Raw source size in this deck directory is about **0.74 MB**; all files in
`rnconnection-assets/` total about **144.8 MB**. These are filesystem source/asset
totals, not application download size or compiled bundle measurements. The
typography entrance implementation is about 12.5 KB, `GlassPanels` about 4.4 KB,
the background family about 21.4 KB, and presenting tools about 20.3 KB before
shared helpers. Keep videos, screenshots, benchmark fixtures and gallery assets
out of general runtime packs.

## Extraction acceptance criteria

Use arbitrary content/data at two stage sizes; preserve preview, preparation,
live, outgoing and paused behavior; preserve native poses during interrupted or
reversed transitions; verify presenter and audience timing remains aligned.
Per-frame work stays in worklets/native/GPU paths, with no JS frame loop or React
state updates for animation. Hidden mounted children need explicit eligibility,
not just opacity zero.

Preserve existing performance improvements: bounded caches, queued captures,
low-resolution blur snapshots, isolated video readiness, shared video frames,
label atlases and analytic shader bounds. Fullscreen shatter/fire/refraction and
liquid-title simulation need profiles at audience resolution before becoming
default effects; GPU execution alone does not establish a frame-time budget.

The closest duplicate pairs are cross-platform lanes, Expo network,
DesktopFoundations and the window-title demo. Their React Conf variants mostly
change pacing, emphasis or one connection pulse; make those options in one
implementation. NativeReactions and CompromiseQuestion have larger behavior and
measurement differences and need an explicit shared design.

Start with typography, materials, backgrounds and presenting tools; then charts
and media; then destruction/particles and generic diagrams. Keep liquid title
absorption and advanced content/device morphs as optional advanced packs until
their geometry and performance contracts are established.
