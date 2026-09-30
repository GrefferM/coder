import { describe, expect, it } from "vitest";
import { groupedNumber } from "./grouped-number";

describe("groupedNumber", () => {
  it("leaves a number under a thousand as it is", () => {
    expect(groupedNumber(0)).toBe("0");
    expect(groupedNumber(999)).toBe("999");
  });

  it("puts a space between thousands, from the right", () => {
    expect(groupedNumber(1_000)).toBe("1 000");
    expect(groupedNumber(12_345)).toBe("12 345");
    expect(groupedNumber(1_234_567)).toBe("1 234 567");
  });

  it("groups by three even when the first group is one digit", () => {
    // Grouping counts from the right: 1 234, not 123 4.
    expect(groupedNumber(1_234)).toBe("1 234");
  });

  it("rounds a fraction rather than writing it out", () => {
    // Tokens are whole counts, so fractions round.
    expect(groupedNumber(1_499.4)).toBe("1 499");
    expect(groupedNumber(1_499.5)).toBe("1 500");
  });

  it("says nought for a number below it, since nothing here is ever negative", () => {
    expect(groupedNumber(-12)).toBe("0");
  });
});
