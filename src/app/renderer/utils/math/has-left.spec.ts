import { describe, expect, it } from "vitest";
import { hasLeft } from "./has-left";

describe("hasLeft", () => {
  it("counts the threshold itself as having left", () => {
    expect(
      hasLeft(
        {
          x: 0,
          y: 0,
        },
        {
          x: 3,
          y: 4,
        },
        5,
      ),
    ).toBe(true);
  });

  it("keeps anything inside the circle a click", () => {
    expect(
      hasLeft(
        {
          x: 10,
          y: 10,
        },
        {
          x: 12,
          y: 11,
        },
        5,
      ),
    ).toBe(false);
  });
});
