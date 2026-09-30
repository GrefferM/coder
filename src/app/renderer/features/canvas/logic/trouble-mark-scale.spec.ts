import { describe, expect, it } from "vitest";
import { SPHERE_TROUBLE_MARK_SIZE_PX } from "../../../components/sphere/constants";
import { CANVAS_MARK_FLOOR_PX } from "../constants";
import { troubleMarkScale } from "./trouble-mark-scale";

/** The mark's size on screen at a canvas scale. */
function screenPx(canvasScale: number): number {
  return SPHERE_TROUBLE_MARK_SIZE_PX * canvasScale * troubleMarkScale(canvasScale);
}

describe("troubleMarkScale", () => {
  it("holds the mark at its own 16px from full size down to half", () => {
    expect(screenPx(1)).toBeCloseTo(16);
    expect(screenPx(0.7)).toBeCloseTo(16);
    expect(screenPx(0.5)).toBeCloseTo(16);
  });

  it("lets it go down with the graph below half size, without a step at the threshold", () => {
    expect(screenPx(0.4)).toBeCloseTo(12.8);
    expect(screenPx(0.5 - 0.0001)).toBeCloseTo(16, 2);
  });

  it("stops at the floor, so the mark never reads as a speck", () => {
    expect(screenPx(0.3)).toBeCloseTo(CANVAS_MARK_FLOOR_PX);
    expect(screenPx(0.25)).toBeCloseTo(CANVAS_MARK_FLOOR_PX);
  });

  it("changes nothing at full size, where the graph and the mark agree", () => {
    expect(troubleMarkScale(1)).toBeCloseTo(1);
  });
});
