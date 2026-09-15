import { describe, expect, it } from "vitest";
import { daySpoken } from "./day-spoken";

const TODAY = new Date(2026, 6, 24, 15, 10);

describe("daySpoken", () => {
  it("says «сьогоднішнього» about today, whatever the hour", () => {
    // The day stands inside a sentence — «від сьогоднішнього до 24 липня».
    expect(daySpoken(new Date(2026, 6, 24, 0, 1), TODAY)).toBe("сьогоднішнього");
    expect(daySpoken(new Date(2026, 6, 24, 23, 59), TODAY)).toBe("сьогоднішнього");
  });

  it("says the day and the month in the form a sentence needs", () => {
    expect(daySpoken(new Date(2026, 6, 22), TODAY)).toBe("22 липня");
    expect(daySpoken(new Date(2026, 0, 1), TODAY)).toBe("1 січня");
    expect(daySpoken(new Date(2026, 11, 31), TODAY)).toBe("31 грудня");
  });

  it("counts today by the day and not by how near the hours are", () => {
    // Yesterday's last minute and today's first are an hour apart and are two different days.
    expect(daySpoken(new Date(2026, 6, 23, 23, 59), TODAY)).toBe("23 липня");
  });

  it("does not call the same day of another year today", () => {
    expect(daySpoken(new Date(2025, 6, 24), TODAY)).toBe("24 липня");
  });
});
