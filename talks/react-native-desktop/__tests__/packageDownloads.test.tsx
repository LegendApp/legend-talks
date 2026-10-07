// @ts-nocheck Native rows expose whether a changing color animation is needed.
import "../../../src/__tests__/nativeMock";
import { expect, mock, test } from "bun:test";
import React from "react";
import { act, create } from "react-test-renderer";
let step = 0;
mock.module("@legend-apps/presentation", () => ({ usePresentationValue: () => step, ProgressivePreparation: ({ children }) => children }));
mock.module("../BenchmarkChart", () => ({ BenchmarkRow: "row", chartLayout: { width: 1696, height: 710, marginTop: 24, top: 55, rowSpacing: 57 } }));
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
    const values = rows().map(row => row.props.value);
    step = 1;
    await act(() => tree.update(<PackageDownloadsChart />));
    expect(rows().map(row => row.props.value)).toEqual(values);
    expect(rows().filter(row => row.props.grouped).map(row => row.props.name)).toEqual(["Electron"]);
  } finally { if (tree) await act(() => tree.unmount()); }
});
