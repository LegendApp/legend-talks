# ReactCon native GPU effects

The RN app is the primary target. GlassStrike shards/chips/sparks and the Spark
explosion/shockwave/cursor use TypeGPU instances through the existing native
Reanimated UI renderer. Intact glass cards retain their Skia renderer, with the
GPU layer prepared but idle. Spark keeps its glyph atlas and small text canvas
on Skia. Migrated layers require TypeGPU; missing support or setup failures
are reported through the slide error boundary. There is no alternate renderer.
Analytic programs submit render passes directly, without compute pipelines or
simulation buffers. Programs with a compute entry point retain their simulation
and alternating state buffers.

The droplet background and Spark network remain on Skia. Native pilot renders
showed no material droplet improvement, and separating the network increased
combined rendering cost. Those experiments were discarded.

Finite effects retain their last frame and stop GPU submissions: Spark at six
seconds and the foundation strike at 4.5 seconds. Returning to their trigger
step replays them. Persistent success checks continue shimmering. Preparing,
preview, and outgoing phases still follow the shared host clock; no native JS
animation loop was added.

## Native measurements

Rerun October 10, 2026 on Apple M4, macOS 26.6.1 (25G76), with the app's Skia 2.11.1 and
react-native-webgpu 0.8.5 Metal libraries. Baselines are apps
`2d61811aef542129d9929541cab0175e09a3bca8` and talks
`d592abd26dfe5f97c994f9ab7c8894454b8941ad`. Candidate WGSL SHA-256 values and
all samples are in [the raw results](reactcon-typegpu-native-results.json).

These are **synchronized offscreen rendering wall times**, from encoding/submission
through completion. They include CPU waiting and backend synchronization cost,
not just GPU execution. Each timestamp has five alternating backend repetitions,
five warmup frames per process, and 15 measured frames per repetition. The table
reports medians over all 75 measured frames at each timestamp.

| Effect / elapsed seconds | Skia ms | TypeGPU/Dawn ms |
| --- | ---: | ---: |
| Glass strike / 0.2, before impact | 0.608 | 0.881 |
| Glass strike / 0.4 | 2.510 | 0.985 |
| Glass strike / 0.65 | 2.827 | 0.976 |
| Glass strike / 1.4 | 3.089 | 0.953 |
| Glass strike / 3 | 2.123 | 0.647 |
| Glass strike / 6 | 0.989 | 0.662 |
| Spark / 1.05 | 6.040 | 0.760 |
| Spark / 1.8 | 6.027 | 0.679 |
| Spark / 2.5 | 6.019 | 0.680 |
| Spark / 4.5, after burst | 0.386 | 0.636 |
| Spark / 6, final frame | 0.400 | 0.748 |

The expensive particle frames improve substantially. Before-impact glass and
settled Spark frames cost slightly more individually. Intact cards keep Skia,
and finite layers stop submitting after settling, rather than continuously
paying that overhead.

Rendered premultiplied RGBA comparisons had maximum whole-image mean absolute
byte differences of 0.1162/255 for glass and 0.0083/255 for Spark. The Spark
comparison supplies transparent glyph children on both sides, isolating the
cursor and particles. Whole-image means include transparent pixels; they are
not a guarantee of pixel equality or perceptual equivalence everywhere.

Limitations: these isolated drivers omit React, UI worklet dispatch, per-frame
uniform uploads, glyph rendering, other slide
layers, device setup, and window presentation. Skia waits through its synchronous
submission API; Dawn waits by mapping its query readback. Their GPU timestamp
columns are not used in the published comparisons. Results do not establish
full-app FPS, memory usage, or performance on iOS/Android. Each full-size HDR
field adds roughly 16 MiB plus its output surface. Main-app visual QA could not
run because another session owned the native app; native shader compilation,
Metal render comparisons, and host lifecycle tests were performed instead.

Reproduce on macOS from the talks checkout:

```sh
bun --preload ./scripts/effectPacks.ts scripts/benchmarkNativeGPU.ts /absolute/scratch/output
```

The script resolves the native libraries from the apps checkout, checks the disk
reserve, builds two isolated render drivers, and writes code, raw RGBA captures,
and timing samples. It preserves no custom rendering infrastructure in the app.

## Export compatibility

The 50-slide ReactCon deck compiles without warnings and exports successfully.
The October 10 single-renderer export checked portal, pipes, Spark, strikes and
opening-title navigation without runtime errors. Browser instrumentation observed
zero compute pipeline creations; the portal allocated only its 32-byte clock
buffer. A forced missing adapter produced a visible slide error instead of
selecting another renderer. Host tests cover both analytic allocation/submission
and real compute buffer alternation.
The tested export bundle SHA-256 is
`21cf8efe556477add29d9a7dbc4ba37952780c6b8efae9230115b31019cdb288`.
Earlier browser playback checked Spark, the objection-card strikes, and the narrow
foundation strike without runtime errors. An offscreen preparation bug in the
WebGPU canvas sizing was fixed before the first surface submission; native
surface sizing is unchanged.

In the October 9 visible collaborative recording, Spark submitted 101 GPU frames over
1.7 seconds, then no further submissions after its six-second cutoff. This
measures queue submission cadence, **not presented FPS**. The browser recorder
itself captured approximately 29 FPS, so its video cannot establish 60 FPS
presentation. Existing browser Skia/video performance limits remain documented
in [the web validation report](../../legend-apps/packages/slides-web/REACTCON_VALIDATION.md).
