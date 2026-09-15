import { describe, expect, it } from "vitest";
import { focusRing } from "./focus-ring";
import {
  INTERACTION_DANGER_FOCUS_RING_COLOR,
  INTERACTION_FOCUS_RING_COLOR,
  INTERACTION_FOCUS_RING_PX,
} from "../../constants";

describe("focusRing", () => {
  it("gives nothing at all while nothing is focused", () => {
    expect(focusRing(false)).toBeUndefined();
  });

  it("lies outside the box, so it moves neither size nor text", () => {
    expect(focusRing(true)).toBe(`0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${INTERACTION_FOCUS_RING_COLOR}`);
  });

  it("wears its own colour on a thing that destroys", () => {
    expect(focusRing(true, true)).toBe(`0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${INTERACTION_DANGER_FOCUS_RING_COLOR}`);
  });
});
