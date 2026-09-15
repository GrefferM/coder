import { describe, expect, it } from "vitest";
import { gridLinePath } from "./grid-line-path";

describe("gridLinePath", () => {
  it("moves to the first point and lines to the rest", () => {
    const path = gridLinePath(
      [
        {
          x: 0,
          y: 0,
          z: 0,
        },
        {
          x: 1,
          y: 2,
          z: 0,
        },
        {
          x: -1,
          y: -2,
          z: 0,
        },
      ],
      0,
    );

    expect(path).toBe("M 0,0 L 1,2 L -1,-2");
  });

  it("centres every point within a radius-sized square", () => {
    const path = gridLinePath(
      [
        {
          x: -5,
          y: 5,
          z: 0,
        },
      ],
      5,
    );

    expect(path).toBe("M 0,10");
  });
});
