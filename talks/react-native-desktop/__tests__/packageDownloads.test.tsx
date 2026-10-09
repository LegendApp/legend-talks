// @ts-nocheck Native rows expose whether a changing color animation is needed.
import "../../../test-support/legend-apps/apps/slides/src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React from "react";
import { act, create } from "react-test-renderer";
let step = 0;
mock.module("@legend-apps/presentation", () => ({ usePresentationValue: () => step, ProgressivePreparation: ({ children }) => children }));
mock.module("../BenchmarkChart", () => ({ BenchmarkRow: "row", chartLayout: { width: 1696, height: 710, marginTop: 24, top: 55, rowSpacing: 57, barLeft: 285, barWidth: 1210, barHeight: 30, rowHeight: 43 } }));
mock.module("../ElectronFire", () => ({ ElectronFire: "fire" }));
const { PackageDownloadsChart } = await import("../PackageDownloadsChart");
test("only Electron allocates the color crossfade and step changes keep every download row", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let tree;
  try {
    await act(() => { tree = create(<PackageDownloadsChart />); });
    const rows = () => tree.root.findAllByType("row");
    expect(rows()).toHaveLength(6);
    expect(rows().filter(row => row.props.groupColor).map(row => row.props.name)).toEqual(["Electron"]);
    expect(rows().every(row => !row.props.grouped)).toBe(true);
    expect(tree.root.findAllByType("fire")).toHaveLength(0);
    const values = rows().map(row => row.props.value);
    step = 1;
    await act(() => tree.update(<PackageDownloadsChart />));
    expect(rows().map(row => row.props.value)).toEqual(values);
    expect(rows().filter(row => row.props.grouped).map(row => row.props.name)).toEqual(["Electron"]);
    const effects = tree.root.findAllByType("fire");
    expect(effects.map(effect => effect.props.layer)).toEqual(["flames", "drops"]);
    for (const effect of effects) {
      expect(effect.props).toMatchObject({ x: 285, y: 175.5, barHeight: 30 });
      expect(effect.props.width).toBeCloseTo(values[2] / values[0] * 1210);
    }
    expect(tree.toJSON().children.map(child => child.type)).toEqual(["fire", ...Array(6).fill("row"), "fire"]);
    step = 0;
    await act(() => tree.update(<PackageDownloadsChart />));
    expect(tree.root.findAllByType("fire")).toHaveLength(0);
    expect(rows().map(row => row.props.value)).toEqual(values);
  } finally { if (tree) await act(() => tree.unmount()); }
});
