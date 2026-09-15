import { describe, expect, it } from "vitest";
import { walkRing } from "./walk-ring";

describe("walkRing", () => {
  it("draws the ring inside the row the walk stands on", () => {
    expect(walkRing(true)).toContain("inset");
  });

  it("draws nothing on a row the walk does not stand on", () => {
    expect(walkRing(false)).toBeUndefined();
  });
});
