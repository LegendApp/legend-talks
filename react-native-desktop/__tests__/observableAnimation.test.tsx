// @ts-nocheck Exercise subscription boundaries with deterministic clock ticks and native leaves.
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { transformSync } from "@babel/core";
import { observable } from "@legendapp/state";
import * as stateReact from "@legendapp/state/react";
import { act, create } from "react-test-renderer";

test("FrameBudget UI samples move leaves without rendering React even at cell boundaries", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const filename = fileURLToPath(new URL("../packs/performance/FrameBudget.tsx", import.meta.url));
  const require = createRequire(filename);
  const counts = {};
  const time$ = { value: 0 };
  const { code } = transformSync(readFileSync(filename, "utf8"), {
    filename, babelrc: false, configFile: false,
    presets: [require.resolve("@react-native/babel-preset")],
    plugins: [({ types: t }) => ({ visitor: { FunctionDeclaration(path) {
      if (["FrameBudget", "BudgetRow", "BudgetFrame", "BudgetCursor", "BudgetPlayhead"].includes(path.node.id?.name)) {
        path.node.body.body.unshift(t.expressionStatement(t.callExpression(t.identifier("countRender"), [t.stringLiteral(path.node.id.name)])));
      }
    } } })],
  });
  const module = { exports: {} };
  const mocks = {
    "@legendapp/state/react": stateReact,
    "react-native": { View: "view", Text: "text", StyleSheet: { create: (styles) => styles } },
    "../shared/FrameView": { FrameView: "frame-view" },
    "../shared/effectRuntime": { useEffectTime$: () => time$ },
  };
  new Function("require", "module", "exports", "countRender", code)(
    (name) => mocks[name] ?? require(name), module, module.exports,
    (name) => { counts[name] = (counts[name] ?? 0) + 1; },
  );
  const FrameBudget = module.exports.FrameBudget;
  let renderer;
  try {
    await act(() => { renderer = create(<FrameBudget />); });
    const initial = { ...counts };
    for (const time of [0.1, 0.2, 0.3]) time$.value = time;
    expect(counts.FrameBudget).toBe(initial.FrameBudget);
    expect(counts.BudgetRow).toBe(initial.BudgetRow);
    expect(counts.BudgetFrame).toBe(initial.BudgetFrame);
    expect(counts.BudgetPlayhead).toBe(initial.BudgetPlayhead);
    expect(counts.BudgetCursor).toBe(initial.BudgetCursor);
    const frames = renderer.root.findAllByType("frame-view");
    const before = frames.map(frame => frame.props.frameStyle());
    time$.value = 0.6;
    expect(frames.map(frame => frame.props.frameStyle())).not.toEqual(before);
    expect(counts.BudgetFrame).toBe(initial.BudgetFrame);
    expect(counts.BudgetCursor).toBe(initial.BudgetCursor);
  } finally {
    if (renderer) await act(() => renderer.unmount());
  }
});
