import { describe, expect, it } from "vitest";
import { gridStep } from "./grid-step";
import { CANVAS_GRID_STEP_PX, CANVAS_WIDE_GRID_SCALE } from "../constants";

describe("gridStep", () => {
  it("draws the grid at its own step while the canvas stands close", () => {
    expect(gridStep(1)).toBe(CANVAS_GRID_STEP_PX);
  });

  it("drops every second dot far out, so the grid keeps reading as a grid", () => {
    // Dots that crowd stop being dots and become a texture.
    const far = CANVAS_WIDE_GRID_SCALE / 2;

    expect(gridStep(far)).toBe(CANVAS_GRID_STEP_PX * far * 2);
  });

  it("takes the wide scale itself as close, not far", () => {
    expect(gridStep(CANVAS_WIDE_GRID_SCALE)).toBe(CANVAS_GRID_STEP_PX * CANVAS_WIDE_GRID_SCALE);
  });
});
