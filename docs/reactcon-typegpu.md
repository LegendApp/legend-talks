# ReactCon TypeGPU migration

The screenshot shatter, falling sprites, portal particle stream, branching pipes
and detached title bubbles use TypeGPU instances. Text, attached/merging liquid,
flames, device glass and labels retain their existing Skia rendering. Title
physics still run in the existing UI worklet; positions and visual clocks reach
the GPU as one snapshot. Unsupported web contexts retain the original Skia
versions, including the screenshot content.

## GPU timer measurements

Measured October 9, 2026 on Apple M4, macOS 26.6.1 (25G76), T3 Code Electron
44.4.2 / Chromium 152.0.7977.130. These are isolated shader GPU workloads,
not browser frame rates, CPU timings, load times or native-app benchmarks.

The harness uses actual CanvasKit WebGL GPU surfaces and
`EXT_disjoint_timer_query_webgl2` for the original Skia shaders; it uses WebGPU
`timestamp-query` for the candidate draw passes. Each shader warms at all three
fixed times before five alternating baseline/candidate repetitions (15 samples).
An unchanged baseline/candidate rerun checks variability. Textures, uniform
values and logical render resolution are fixed; asset decoding, pipeline setup,
compositor cost and JS submission overhead are excluded. Portal timing includes
both field and lens passes. Pipe candidate timing includes its retained Skia
panel shader, measured separately and added to the geometry time; it excludes
compositing between their two canvases.

| Effect | Logical pixels | Median baseline → candidate | Unchanged rerun |
| --- | --- | --- | --- |
| Screenshot shatter | 1920×1180 | 8.42 → 0.13 ms | 8.50 → 0.20 ms |
| Falling sprites | 624×824 | 0.45 → 0.07 ms | 0.39 → 0.07 ms |
| Portal stream + lens | 1696×650 | 2.56 → 0.79 ms | 2.54 → 0.72 ms |
| Mobile pipes + panels | 1824×1080 | 2.61 → 1.20 ms | 1.61 → 0.89 ms |
| Desktop pipes + panels | 1824×1080 | 2.86 → 0.86 ms | 3.14 → 0.82 ms |

The shatter and portal improvements exceed the baseline rerun variation. Sprite
results favor instancing, but the small absolute costs are near WebGPU's observed
0.065536 ms timestamp quantization and include outliers. Mobile pipe results are
noisy and overlap; do not infer an exact percentage improvement from them.
Desktop pipe results favor the migration in both runs. Detached title bubbles
were only smoke-tested with synthetic positions, without a before/after claim;
its simulation and text work have not been benchmarked.

Raw samples and playback checks are in [reactcon-typegpu-results.json](reactcon-typegpu-results.json).
The host baseline reference is `352a30389f4a7fd3184ca53f8d7d4b10bff0b5fb` and
the talk baseline is `ca23c7c` (root-folder move). The baseline shader strings
are preserved as unsupported-context fallbacks; the pipe baseline sets
`gpuGeometry=0`. Candidate inputs are the task's source changes plus generated
fixtures with SHA-256
`fa803744603cd54e186a4271190c10614a3b7d9fac7a9324c66f4bad9abface4`.
The tested production bundle is
`1ba3bd4c242a5fa6f40e2552cfb784cf5c2c1d0557234fbfd0777b9d88042dd7`.

## Reproduce

Export `react-native-desktop/reactcon.mdx` from the host checkout. Then, from this
checkout, generate the benchmark inputs:

```sh
bun --preload ./scripts/effectPacks.ts scripts/gpuMigrationFixtures.ts ../legend-apps/dist/reactcon/gpu-migration-fixtures.json
```

Serve the export on localhost or HTTPS, load the host's
`packages/slides-web/tests/gpu-migration-benchmark.js` in the browser, and call
`benchmarkGPUMigration("shatter")` (also `sprites`, `portal`, `mobile-pipes`,
`desktop-pipes`). Load `gpu-migration-playback.js` and call
`auditGPUMigration()` while the preview is visible or recording. Its full run
lasts about 30 seconds; collect the promise result asynchronously when automation
has a shorter evaluation timeout.

Playback at 1280×800/DPR 2 submitted 60–61 frames per GPU queue in each of three
one-second windows. Impact navigation preserved ambient time, sidebar resizing
preserved playback, and removal stopped submissions. These checks do not prove
presented-frame cadence; retained Skia layers still have their measured browser
limit. Native Dawn/Metal compiled all new programs. Native app UI inspection
was unavailable because another agent-device session owned the running app.
