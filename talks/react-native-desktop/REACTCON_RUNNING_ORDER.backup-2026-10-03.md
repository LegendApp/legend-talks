# ReactCon running order

The talk has 36 slides and ends at the closing. There is no appendix. Step
counts include the initial state. Speaker-note comments follow this route, with
short spoken paragraphs and numbered reveal cues.

## Opening: why desktop, and what holds it back

| Slide | Content | States |
| --- | --- | --- |
| 1 | React Native is the best way to build desktop apps | 3 |
| 2 | React Native Directory | 1 |
| 3 | I wanted those checkmarks | 1 |
| 4 | I came here to test LegendList | 2 |
| 5 | Then I made apps I wanted — Photos and Music | 2 |
| 6 | Native would be faster | 2 |
| 7 | Why isn't everyone doing this? | 1 |
| 8 | Three blockers → zoom into Performance concerns | 2 |

The three cards are Performance concerns, Library support, and Desktop
foundations. Introduce them together before the benchmarks; use callbacks to
focus the next chapter rather than restarting the argument.

## Performance: baseline, real app, heavier workload

| Slide | Content | States |
| --- | --- | --- |
| 9 | Was I just imagining it? → So I measured it | 2 |
| 10 | Hello World · first content | 2 |
| 11 | Hello World · installed size | 6 |
| 12 | Legend Music · app size | 1 |
| 13 | Legend Music · CPU | 1 |
| 14 | Legend Music · memory | 1 |
| 15 | What about a heavier workload? | 1 |
| 16 | Chat History: hero → grid → RN → Electron → GPUI | 5 |
| 17 | Chat History · first content | 2 |
| 18 | Chat History · switch conversation | 2 |
| 19 | In the leading group on every metric | 1 |

The installed-size slide retains its original six-state animation: full chart →
engine groups → native platform → bundled browsers → included runtimes → size
buckets. Rows move between groups and focused sections while bar lengths retain
the same scale. Its speaker notes use the original six reveal cues. Music is the
first real-app example; Chat History demonstrates a heavier workload without
touring every competitor. The overview concludes the benchmark section once.

Music captures and values are historical evidence from the RNL 2025 talk,
stored locally in `rnconnection-assets/rnl-2025/`. They are separate from the
dated Hello World and Chat History benchmark snapshots. The charts do not claim
universal wins or identical architectures; their notes retain the qualifications.

## Desktop foundations: from shared needs to Spark

| Slide | Content | States |
| --- | --- | --- |
| 20 | Roadmap callback → Desktop foundations | 2 |
| 21 | So I kept building — Code, Diff, Chat History | 3 |
| 22 | So many apps — shared roots | 1 |
| 23 | Desktop foundations → Legend Spark | 6 |
| 24 | Built on Expo Desktop | 2 |
| 25 | Legend Spark | 1 |
| 26 | Spark Runner | 2 |
| 27 | Edit the app: prompt → preview → apply | 3 |
| 28 | Native UI Matters | 3 |
| 29 | It's React Native | 1 |
| 30 | React Native everywhere | 1 |

The app-editing slide is an illustrated storyboard, not real screenshots. The
app author decides the entry point; Settings → Customize app is the example.
Its prompt asks for a compact player mode in Playback settings. The prompt stays
above the before/preview views, then Apply reveals the after state. Choose a real
demo app and replace the illustration with matching captures or a recording
before presenting it as a completed feature demonstration. Rehearse the added
control working in the running app.

Native UI and developer experience follow Spark as the payoff of those
foundations. They do not reopen the benchmark comparison.

## Library support, Slides reveal, and close

| Slide | Content | States |
| --- | --- | --- |
| 31 | Roadmap callback → Library support | 2 |
| 32 | Library support snapshot | 1 |
| 33 | Please help | 1 |
| 34 | One more thing | 1 |
| 35 | Legend Slides | 5 |
| 36 | React Native is the best way to build desktop apps | 1 |

The library overview is a local integration snapshot, not a complete audit.
Refresh platform, library, public release, and destination-link status before
presenting. Performance and foundations checks on the roadmap mean the concern
has a demonstrated answer, not complete API parity or universal performance wins.

The Legend Slides announcement leads directly into the closing.

## Validation

- Real Legend Slides compiler: 36 slides, zero errors, zero warnings.
- Repository TypeScript check passed.
- Focused tour/navigation, composer geometry, and deck animation-clock audit passed.
- Native visual and presentation navigation verification remains outstanding;
  the installed release app did not finish loading the deck during inspection.

All new motion uses the host presentation clock, native poses, or GPU shaders.
Compilation and geometry checks do not establish native visual correctness.
