# Animated backgrounds

In `../../RNConnection.tsx`, change the background inside `<Background>`:

```tsx
<AnimatedAtmosphere variant="droplets" brightness={1} speed={1} />
```

- `variant`: `"droplets"`, `"glass"`, `"fluid"`, `"smoke"`, or `"wireframe"`. Unknown values fall back to Fluid.
- `brightness`: light multiplier; `0` is black, `0.5` is half brightness, `1` is the designed level
- `speed`: overall motion multiplier; `0` pauses, `0.5` is half speed, `2` is double speed. All variants use the same steady clock, with motion tuned for each effect.
- `slideChangeBoost`: extra speed on slide changes, scaled by `speed`. By default it adds twice the idle speed, so the peak is 3× steady motion for every variant. The burst reaches peak speed in 120 ms, then decays with a long, soft tail, returning to idle at 3.5 seconds. Set `0` for constant drift. Chart steps do not trigger it.

You can also import `Droplets`, `GlassAtmosphere`, `Fluid`, `Smoke`, or `Wireframe` from this directory and pass the same brightness/speed props. Copy this background pack into another deck to reuse it. `AmbientAurora` remains available with its existing `intensity` and `baseBrightness` props.

These are procedural Skia shader effects, not recorded videos or physics simulations. Droplets smoothly merges and separates clear lenses over a dark slate backdrop and faint grid. The lenses refract that backdrop with directional bevel highlights; slide text stays crisp above the effect. Glass shades a continuous full-screen rippling sheet with broad, dim silver-blue reflections; it does not refract slide content. Fluid uses warped noise and lit contour ridges; Smoke uses drifting layered noise; Wireframe uses a continuously deformed mesh. Their center stays dark for slide content. The host's Reanimated UI-thread clock drives shader time without per-frame JS/React updates. Presenter previews stay static while the audience view animates, and the persistent background continues across slides. The clock integrates speed continuously, so changing speed does not reposition the pattern. Pausing holds the current frame. Aurora retains its original constant clock rate.


## TypeGPU glass comparison

`TypeGPUGlassBackground.tsx` combines the normal Skia droplet styling with six
GPU-simulated bubbles. The original Skia component and deck default are unchanged.
The final two comparison slides in `rnconnection.mdx` show the same title with
Skia, then TypeGPU. Use left/right to compare.

To switch an individual slide to TypeGPU, add this import once at the top of the deck:

```mdx
import { TypeGPUGlassBackground } from "./packs/backgrounds/TypeGPUGlassBackground"
```

Then add this inside that slide:

```mdx
<TypeGPUGlassBackground><TypeGPUShader /></TypeGPUGlassBackground>
```

Remove that block to return to the inherited Skia background. Do not add a second
explicit background on the same slide. The wrapper configures the host shader;
it does not create a JS animation loop. The titlebar intensity control applies
to both versions. Source-only validation does not establish comparative GPU cost.

The existing TypeGPU host recreates its resources when the slide index changes,
so this comparison currently restarts the simulation on navigation. This is a
slide-level experiment, not a replacement for the persistent Skia deck background.
