import { describe, expect, it } from "vitest";
import { repeatCount } from "./repeat-count";

describe("repeatCount", () => {
  it("takes the typed count as it is inside the bounds", () => {
    expect(repeatCount("5", 1)).toBe(5);
  });

  it("holds the count at one and at 999", () => {
    expect(repeatCount("0", 3)).toBe(1);
    expect(repeatCount("-4", 3)).toBe(1);
    expect(repeatCount("1500", 3)).toBe(999);
  });

  it("keeps the count it had when nothing countable was typed", () => {
    expect(repeatCount("", 7)).toBe(7);
    expect(repeatCount("abc", 7)).toBe(7);
  });
});
