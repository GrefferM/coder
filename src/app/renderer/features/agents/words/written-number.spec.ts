import { describe, expect, it } from "vitest";
import { writtenNumber } from "./written-number";

describe("writtenNumber", () => {
  it("writes a whole number without any places asked for", () => {
    expect(writtenNumber(8)).toBe("8");
  });

  it("writes as many places as the field keeps, even when they are noughts", () => {
    // Temperature is kept to two places, so 0 is «0.00» and not «0» — the field's own writing.
    expect(writtenNumber(0, 2)).toBe("0.00");
    expect(writtenNumber(0.3, 2)).toBe("0.30");
  });

  it("cuts a number to the places asked for", () => {
    expect(writtenNumber(0.256, 2)).toBe("0.26");
  });

  it("says a dash where nobody wrote a number, and never a nought", () => {
    // An empty field and a field holding nought are two different things on screen.
    expect(writtenNumber(null)).toBe("—");
    expect(writtenNumber(null, 2)).toBe("—");
    expect(writtenNumber(0)).toBe("0");
  });
});
