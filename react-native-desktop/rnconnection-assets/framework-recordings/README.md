# Framework presentation recordings

Deck-local copies of the finished September 22, 2026 presentation captures.
Clips are 2560 × 1440, H.264, 60 fps output. PNGs are matching stills.
These are scrolling demonstrations, not startup benchmark footage. Source motion
may repeat frames (notably Flutter and the slowed React Native reference).

The nine-framework carousel uses Deno CEF for its combined Deno card. Deno WebView
is also included here. Each HTML player references only sibling local media.
Grid and presenter previews use stills; the centered live carousel card plays video.

On October 7, the nine carousel clips had their static lead-in and tail trimmed
to about 0.2 seconds each so the loop restarts promptly. Scrolling speed and all
interior frames, including existing repeated frames, retain their original timing.
The unused Deno WebView clip remains ten seconds. The original ten-second files
are retained in Git at `542ea72bd32d71a98b8e46e5c31eb86b3af7b73d`.

| Clip | Original frame range (start inclusive, end exclusive) | Loop duration |
| --- | --- | --- |
| AppKit | 57–549 | 8.2 s |
| Compose | 60–548 | 8.1 s |
| Deno CEF | 58–546 | 8.1 s |
| Electron | 60–542 | 8.0 s |
| Flutter | 61–541 | 8.0 s |
| GPUI | 58–548 | 8.2 s |
| React Native | 38–564 | 8.8 s |
| SwiftUI | 57–543 | 8.1 s |
| Tauri | 58–548 | 8.2 s |

Trims were re-encoded with `libx264`, CRF 16, `veryfast`, `yuv420p`, and fast-start
MP4 metadata. Output frame counts match the retained ranges; frames are neither
interpolated nor sped up. The playback code still loops at the actual file end.
