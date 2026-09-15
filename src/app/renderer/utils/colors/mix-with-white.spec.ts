import { describe, expect, it } from "vitest";
import { mixWithWhite } from "./mix-with-white";

describe("mixWithWhite", () => {
  it("builds a color-mix expression lightening the color by the given percent of white", () => {
    expect(mixWithWhite("#b18aff", 55)).toBe("color-mix(in srgb, #ffffff 55%, #b18aff)");
  });
});
