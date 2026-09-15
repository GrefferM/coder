import { describe, expect, it } from "vitest";
import { mixWithTransparent } from "./mix-with-transparent";

describe("mixWithTransparent", () => {
  it("builds a color-mix expression blending the color toward transparent by the given percent", () => {
    expect(mixWithTransparent("#b18aff", 55)).toBe("color-mix(in srgb, #b18aff 55%, transparent)");
  });
});
