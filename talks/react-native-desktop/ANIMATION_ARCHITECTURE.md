# RNConnection animation ownership

The complete `rnconnection.mdx` talk, including alternate slides, uses host-owned playback or navigation timing. Deck components specify geometry, shaders, poses, durations, and keyframes. They do not start animation clocks.

| Behavior | Shared app API | Timeline |
| --- | --- | --- |
| Background, glass, roots, renderer windows, platform lanes | `useAnimatedShaderUniforms` | Slide clock; background scope stays continuous across slides |
| Expo connection, module waves | Shader `stepIndex` and `stepTime` | Current step |
| Frame glass → publishing network → explosion → cursor typing | Shared LiquidGlass shader, `useLiquidGlassPlayback`, shader text atlas | Glass tween on step 4; reveal anchored to step 5; one persistent Canvas |
| Shattered objections and subsequent zoom | Shader option `{ clock: 1 }` | Time since step 1; survives step 2 |
| Native poses and interrupted moves | `SceneMotionView`, `usePlaybackTween` | Shared step clock |
| Chart row grouping | `ScenePositionView` | Shared tween; fixed native layout for measurement |
| Chart entrance vs matched resize | `useSharedElementEntrance` | Host shared-element lifecycle |
| Carousel position, scale, opacity, stacking | `FilmstripMotionView` | Shared tween |
| Carousel exit | `NavigationExitView` | Audience navigation progress |
| Emoji paths and ecosystem label | `PlaybackKeyframeView` | Explicit slide or step clock |
| TypeGPU simulations | `TypeGPUShader` | Shared step time; simulation resets on activation/step change |
| Headers, shared elements, whole-slide transitions | Host navigation controller | Native navigation progress |

Mounting a shader after a step does not create a new clock. Choose its timeline explicitly. The objections use step 1 rather than remounting their Canvas to restart elapsed slide time.

Preparation samples zero. Previews sample a deterministic still. Activation resets playback. Outgoing effects freeze while navigation animates their exit. Without an audience window, the presenter's current slide still plays.

## Adding effects

- Keep playback hooks above the Skia Canvas boundary and pass derived uniforms down.
- Use `{ clock: "step" }` for an effect that restarts on every advance.
- Use `{ clock: 1 }` for an effect triggered by the first advance that continues through later reveals.
- Use `PlaybackKeyframeView` for native sequences, delays, and repeated trajectories.
- Use `SceneMotionView` for state-selected poses; interrupted moves continue from the displayed pose.
- Never snapshot a shared clock on JS or reset one part of an effect with a separate timer.

## Audit and verification

`deckPlaybackAudit.test.ts` traverses local imports/re-exports, including the template and alternates, and rejects private animation drivers. Lifecycle tests cover preparation, preview promotion, next/back/replay, outgoing freeze, interrupted carousel movement, navigation-owned exits, long frames, and step-anchored effects.

Other presentations (`talk.mdx`, `effects.mdx`) and unused legacy effect packs are outside this migration. Their old helpers are not executed by RNConnection. The generic legacy `useStep().elapsed` and old TypeGPU adapter are also unused by this deck.

Source tests are not live macOS verification. Check chart grouping, carousel zoom/exit, both shattered cards, Expo connection, emoji ramp, and the alternate ecosystem slide with the audience window open and closed.
