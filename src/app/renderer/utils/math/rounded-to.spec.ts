import { describe, expect, it } from "vitest";
import { roundedTo } from "./rounded-to";

describe("roundedTo", () => {
  it("drops what a run of additions left past the places asked for", () => {
    expect(roundedTo(1 - 0.1 - 0.1 - 0.1 - 0.1 - 0.1, 2)).toBe(0.5);
  });

  it("leaves a value that already fits", () => {
    expect(roundedTo(-40, 2)).toBe(-40);
  });

  it("rounds rather than truncates", () => {
    expect(roundedTo(0.125, 2)).toBe(0.13);
  });
});
