import { describe, expect, it } from "vitest";
import { roundedRectPath } from "./rounded-rect-path";

describe("roundedRectPath · the line the glow runs along", () => {
  it("closes the outline, so a particle comes back to where it started", () => {
    expect(roundedRectPath(100, 40, 8).endsWith("Z")).toBe(true);
  });

  it("starts one corner in from the left, where the top side begins", () => {
    expect(roundedRectPath(100, 40, 8).startsWith("M8,0 H92 ")).toBe(true);
  });

  it("holds a corner bigger than half the box to that half, so the corners never cross", () => {
    expect(roundedRectPath(40, 20, 999)).toBe(roundedRectPath(40, 20, 10));
  });

  it("draws a box asked for no corner at all with square ones", () => {
    expect(roundedRectPath(100, 40, 0).startsWith("M0,0 H100 ")).toBe(true);
  });
});
