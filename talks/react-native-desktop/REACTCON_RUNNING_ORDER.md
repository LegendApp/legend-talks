# ReactCon review deck

`reactcon.mdx` starts again from the original 48-slide `rnconnection.mdx`.
All original slides, speaker comments, reveal counts, and relative ordering are
retained. The current frosted glass and rotating edge lighting remain in the
shared components. The three historical Music measurement slides are inserted
after the Hello World charts, and the audience-facing Existing Modules labels
are renamed Library support, including the animated roadmap callback.

There are 51 slides. No suggested cut or ordering change has been applied.
The original Expo Desktop portal, Spark foundation branches and WebView shatter,
22-state app tour with GPUI glass takeover, three-state roadmap callbacks, and
five-state Legend Slides reveal are present.

The former 36-slide version is saved as
[reactcon-backup-2026-10-03.mdx](reactcon-backup-2026-10-03.mdx), with its running
order saved as `REACTCON_RUNNING_ORDER.backup-2026-10-03.md`. That deck still uses
its former component paths and chapter behavior.

## Suggested removals for review

Each candidate displays a large red REMOVE overlay at the top on every reveal.
It is a review marker, not a deletion. The overlay uses slide metadata
`reviewRemove: true` and does not take space from the original layout.

| Current slide | Candidate | Reason |
| --- | --- | --- |
| 12 | What you write | The language-by-language comparison extends the competitor detour. |
| 13 | Monthly package downloads | Adds a market-size argument without advancing the performance or tooling story. |
| 16 | Hello World · memory | Music provides a more concrete memory example. |
| 24 | Chat History · memory | Keep the summary's memory result instead of another full chart explanation. |
| 25 | Chat History · jump to top | Switching conversations can carry the interaction-performance example. |
| 27 | Chat History · app size | The size story is already covered by Hello World, Music, and the summary. |
| 29 | Performance metrics / balance | Repeats the conclusion immediately after the four-metric summary. |
| 32 | Cross platform | The comparison table repeats React Native everywhere and reopens competitor detail. |
| 33 | Writing versus maintaining with AI | A separate argument that interrupts the route toward desktop tooling. The animation is good; review the tradeoff. |
| 34 | Full framework comparison | Another overall verdict after the benchmarks and React benefits. |
| 39 | Desktop is behind | Version details interrupt the Expo-to-Spark reveal. |
| 40 | macOS is catching up | A release-status update that dates quickly and prolongs the same interruption. |
| 47 | Expo Modules snapshot | A second compatibility table after the library-support overview. |

The animated compromise question, rendering primer, Expo portal, Spark
foundations joke, full tour, roadmap shattering, and Slides reveal are deliberately
unmarked. A shorter talk does not require removing these moments.

## Proposed order — not applied

This proposal assumes the marked cuts are accepted; those decisions remain open.
It uses the current review-deck slide numbers so each move can be checked.

| Section | Proposed slides | Change to review |
| --- | --- | --- |
| Origin story and apps | 1–9 | Keep the original opening and app showcase together. |
| Why desktop isn't the default | 35, then the initial state of 36 | Introduce the three unresolved blockers before the evidence. |
| Performance | 10–11, 14–15, 20, 17–19, 21, 23, 26, 28 | Baseline → real-app bridge → Music → Chat History → one verdict. |
| Resolve performance, focus foundations | Remaining states of 36 | Play the original performance strike/check and focus transition after the benchmarks. |
| Expo Desktop | 37–38 | Keep the platform explanation immediately followed by the portal announcement. |
| Legend Spark | 41–44 | Desktop needs → Spark reveal → APIs → animated foundations/WebView joke → Runner. |
| What those foundations enable | 22, 30–31 | Native integration and React development benefits follow Spark, with their animations intact. |
| Library support | 45–46, 48 | Play the original foundations shatter/check, zoom into Library support, then invite help. |
| Slides reveal and close | 49–51 | One more thing → the complete Slides announcement → closing. |

Moving slide 36 would require splitting its introduction from its later resolved
states while preserving the strike, shatter, and zoom animations. No settled
checks should replace those reveals. This is part of the proposal, not a current
component change.

Moving the real-app bridge before Music would need only its final handoff line
adjusted; the original comments currently remain verbatim. No broader voice pass
is proposed.

Separately, the 22-state tour could be shortened to ten selected states while
keeping the visual payoff: hero, grid, RN overview/sidebar/composer, Electron
overview/composer, GPUI overview/composer/glass takeover. This is also unapplied;
the review deck still contains the entire original tour.

## Validation

Compiler checks cover the review and backup decks. Original comment text and
reveal counts are checked against the source deck. Focused tour/reveal-order
checks and the repository TypeScript check cover the changed files. These checks
do not establish native visual validation of the REMOVE overlay.
