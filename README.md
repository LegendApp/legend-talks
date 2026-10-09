# Legend Talks

Talks, custom presentation components, assets, and speaker notes for Legend Slides.
The Slides application and presentation engine live in [Legend Apps](https://github.com/LegendApp/legend-apps).

## Talks

The [React Native desktop series](talks/react-native-desktop/) keeps related conference versions together:

- [React Conf](talks/react-native-desktop/reactcon.mdx)
- [RNConnection](talks/react-native-desktop/rnconnection.mdx)
- [Original desktop talk](talks/react-native-desktop/talk.mdx)
- [Effects gallery](talks/react-native-desktop/effects.mdx)

Keep each deck's components and assets together under its directory. The compiler
rejects local imports that escape that directory. Share components across versions
of a talk within its folder; introduce cross-talk sharing only when needed.

## Open a talk

Open an `.mdx` file in Legend Slides. With a configured Legend Apps development
checkout, run from that checkout:

```sh
bun run slides run macos -- /absolute/path/to/legend-talks/talks/react-native-desktop/reactcon.mdx
```

The application supplies React Native, presentation APIs, and native dependencies.
Playing a deck does not require installing dependencies in this repository.

## Validate and test

Install Legend Apps dependencies using that repository's instructions. Put the
checkouts beside each other, or set `LEGEND_APPS_PATH` to the Legend Apps checkout:

```sh
export LEGEND_APPS_PATH=/absolute/path/to/legend-apps
bun run setup
bun run validate
bun run test
bun run typecheck
```

Validation compiles every MDX file, including archived versions and diagnostic
decks. To compile one file, pass its path to `bun run validate`.
Tests run in separate processes because Bun caches native module mocks.
Typechecking covers talk components; runtime compilation and native rehearsal
remain separate checks.

Setup creates ignored links to the host checkout and its installed dependencies.
Talk tests use `test-support/legend-apps` for the host's mocks and engine internals.
Run setup again when changing host checkouts; it refuses to overwrite real files.

## History

The initial history contains the commits affecting `apps/slides/decks/` in Legend
Apps, with that prefix renamed to `talks/`. Unrelated application files were
excluded. Commit hashes change during extraction; authors and commit messages are
preserved. The migration also preserves the local diagnostic deck present at the
time of extraction.

Existing per-talk rehearsal notes describe earlier checks. They are historical
evidence, not a guarantee that every later engine version behaves identically.
