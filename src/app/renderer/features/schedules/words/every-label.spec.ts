import { describe, expect, it } from "vitest";
import { everyLabel } from "./every-label";

describe("everyLabel", () => {
  it("says an interval under an hour in minutes", () => {
    expect(everyLabel(15)).toBe("КОЖНІ 15 ХВ");
  });

  it("says a whole number of hours in hours", () => {
    expect(everyLabel(120)).toBe("КОЖНІ 2 ГОД");
  });

  it("says hours and the minutes left over", () => {
    expect(everyLabel(90)).toBe("КОЖНІ 1 ГОД 30 ХВ");
  });
});
