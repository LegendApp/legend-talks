// @ts-nocheck This suite uses Bun test globals, like the other Slides suites.
import { expect, test } from "bun:test";
import { appCardLayout, appOrder } from "../NineAppsGeometry";

test("nine-app lineup combines Deno and includes Compose, with RN first", () => {
  expect(appOrder).toHaveLength(9);
  expect(appOrder[0]).toBe("react-native");
  expect(appOrder.filter(id => id.startsWith("deno"))).toEqual(["deno"]);
  expect(appOrder).toContain("compose");
  expect(appCardLayout(0, "grid")).toMatchObject({ x: 520, y: 285 });
  expect(new Set(appOrder.map((_, i) => JSON.stringify(appCardLayout(i, "grid")))).size).toBe(9);
});

test("filmstrip centers the selected card and never wraps later cards to the left", () => {
  const first = appCardLayout(0, "filmstrip");
  expect(first.x).toBe(960);
  for (let selected = 0; selected < appOrder.length; selected++) {
    expect(appCardLayout(selected, "filmstrip", selected).x).toBe(960);
  }
  for (let i = 1; i < appOrder.length; i++) {
    expect(appCardLayout(i, "filmstrip").x).toBeGreaterThan(first.x);
  }
  expect(appCardLayout(1, "filmstrip", 1).width).toBeGreaterThan(appCardLayout(0, "filmstrip", 1).width);
  expect(appCardLayout(8, "filmstrip", 1000)).toEqual(appCardLayout(8, "filmstrip", 8));
});

import { detailCamera, shortTourSteps, tourSteps, tourStep } from "../NineAppsTour";
import { readFileSync } from "node:fs";

test("manual tour covers every app in rendering order, with close-ups on each group's first app", () => {
  expect([...new Set(tourSteps.map(step => step.app))]).toEqual([...appOrder]);
  for (const app of ["react-native", "electron", "flutter"]) {
    expect(tourSteps.filter(step => step.app === app).map(step => step.detail)).toEqual(["app", "sidebar", "composer", "app"]);
  }
  expect(tourSteps.slice(-3)).toEqual([
    { app: "gpui", detail: "app" }, { app: "gpui", detail: "composer" },
    { app: "gpui", detail: "takeover" },
  ]);
  expect(tourStep(-1)).toEqual(tourSteps[0]);
  expect(tourStep(999)).toEqual(tourSteps.at(-1));
});

test("main talk uses the short tour and two chat comparisons before moving to foundations", () => {
  expect(shortTourSteps).toEqual([
    { app: "react-native", detail: "app" },
    { app: "electron", detail: "app" },
    { app: "gpui", detail: "app" },
  ]);
  expect(tourStep(-1, shortTourSteps)).toEqual(shortTourSteps[0]);
  expect(tourStep(999, shortTourSteps)).toEqual(shortTourSteps.at(-1));
  const deck = readFileSync(new URL("../reactcon.mdx", import.meta.url), "utf8");
  expect(deck).not.toMatch(/appendix/i);
  expect(deck).not.toContain('<NineApps />');
  const main = deck;
  expect(main).toContain(`template: ./NineApps.tsx\nsteps: ${shortTourSteps.length + 2}\n`);
  expect(main.match(/<Chart metric="\w+" \/>/g)).toEqual([
    '<Chart metric="content" />', '<Chart metric="switch" />',
  ]);
  const positions = [
    '<DesktopObjectionsReactcon chapter="performance"', "title: Hello World · first content",
    '<NineApps tour="short"', '<Chart metric="content"', '<Chart metric="switch"',
    '<DesktopObjectionsReactcon chapter="foundations"', '<SparkAppEditing', '<DesktopObjectionsReactcon chapter="modules"',
  ].map(marker => main.indexOf(marker));
  expect(positions.every(position => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});

test("detail cameras share the composer framing through the glass finale", () => {
  expect(detailCamera("app")).toEqual({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  expect(detailCamera("sidebar").scaleX).toBeGreaterThan(1);
  expect(detailCamera("composer").scaleX).toBeGreaterThan(1);
  expect(detailCamera("fake")).toEqual(detailCamera("composer"));
  expect(detailCamera("takeover")).toEqual(detailCamera("composer"));
});

test("recorded composers land at the center of the zoomed stage", () => {
  const width = 1560;
  const videoHeight = width * 9 / 16;
  const videoTop = 555 - width * 0.625 / 2 + width * 0.0625;
  for (const app of ["electron", "flutter", "gpui"]) {
    const camera = detailCamera("composer", app);
    const cx = 180 + (698 + 1684 / 2) / 2560 * width;
    const cy = videoTop + (1208 + 120 / 2) / 1440 * videoHeight;
    expect(960 + (cx - 960) * camera.scaleX + camera.x).toBeCloseTo(960);
    expect(540 + (cy - 540) * camera.scaleY + camera.y).toBeCloseTo(540);
  }
});
