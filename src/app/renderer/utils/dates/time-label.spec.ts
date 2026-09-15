import { describe, expect, it } from "vitest";
import { timeLabel } from "./time-label";

describe("timeLabel", () => {
  it("writes the hour and the minute", () => {
    expect(timeLabel(new Date(2026, 7, 12, 14, 32))).toBe("14:32");
  });

  it("pads a single digit so the times under one another line up", () => {
    expect(timeLabel(new Date(2026, 7, 12, 9, 5))).toBe("09:05");
  });

  it("writes midnight as the day's own start", () => {
    expect(timeLabel(new Date(2026, 7, 12, 0, 0))).toBe("00:00");
  });
});
