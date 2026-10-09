import { defineTransition } from "@legend-apps/presentation";

export default defineTransition({
  duration: 550,
  easing: "ease-in-out",
  sharedElements: "independent",
  styles: ({ progress, hasBackground }) => ({
    incoming: { opacity: progress },
    outgoing: { opacity: hasBackground ? 1 - progress : 1 },
  }),
});
