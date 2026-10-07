// @ts-nocheck Native drawing is mocked; presentation subscriptions stay real.
import "../../../src/__tests__/nativeMock";
import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import { PresentationProvider, SceneMotionView } from "@legend-apps/presentation";
import React from "react";
import { act, create } from "react-test-renderer";
import { AnimatedTitle } from "../AnimatedTitle";
import { CompromiseQuestion } from "../reactcon-scenes/CompromiseQuestion";

test("statement entrance stays mounted while the next step rearranges into a question", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const runtime$ = observable({ isActive: true, isPreview: false, isPreparing: false,
    slideIndex: 0, stepIndex: 0, stepCount: 2, stepEpochs: {} });
  let tree;
  try {
    await act(() => {
      tree = create(<PresentationProvider value={runtime$}><CompromiseQuestion title={
        <AnimatedTitle effect="letter-wave" fontSize={72}>React Native is a Compromise</AnimatedTitle>
      } /></PresentationProvider>);
    });
    const entrance = tree.root.findByType(AnimatedTitle);
    const row = () => tree.root.findByProps({ accessibilityRole: "header", accessibilityLabel: "Is React Native a Compromise?" });
    const statement = tree.root.findAllByProps({ accessibilityRole: "header", accessibilityLabel: "React Native is a Compromise" })
      .find(node => node.props.style?.flexDirection === "row");
    await act(() => statement.findAllByType("text")[0].props.onLayout({ nativeEvent: { layout: { width: 450 } } }));
    for (const step of [0, 1, 0, 1]) {
      await act(() => runtime$.stepIndex.set(step));
      expect(tree.root.findByType(AnimatedTitle)).toBe(entrance);
      expect(entrance.parent.props.style.opacity).toBe(step === 0 ? 1 : 0);
      expect(entrance.parent.props.accessibilityElementsHidden).toBe(step === 1);
      const heading = step === 1 ? row() : statement;
      expect(heading.props.style.opacity).toBe(step === 1 ? 1 : 0);
      const moving = heading.findAllByType(SceneMotionView);
      expect(moving[0].props.pose.x).toBe(step === 1 ? 72 : 0);
      expect(moving[1].props.pose.x).toBe(step === 1 ? -470 : 0);
    }
  } finally {
    if (tree) await act(() => tree.unmount());
  }
});
