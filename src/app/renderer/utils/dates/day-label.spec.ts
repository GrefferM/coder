import { describe, expect, it } from "vitest";
import { dayLabel } from "./day-label";

describe("dayLabel", () => {
  it("writes today as a word, not a date", () => {
    expect(dayLabel(new Date(2026, 7, 12, 9), new Date(2026, 7, 12, 21))).toBe("СЬОГОДНІ");
  });

  it("writes any other day as a day and a month", () => {
    expect(dayLabel(new Date(2026, 7, 9), new Date(2026, 7, 12))).toBe("9 СЕР");
  });

  it("tells the same day of a different year apart from today", () => {
    expect(dayLabel(new Date(2025, 7, 12), new Date(2026, 7, 12))).toBe("12 СЕР");
  });
});
