import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { timeLabel } from "./time-label";

describe("timeLabel", () => {
  it("writes the hour and the minute", () => {
    assert.equal(timeLabel(new Date(2026, 7, 12, 14, 32)), "14:32");
  });

  it("pads a single digit so the times under one another line up", () => {
    assert.equal(timeLabel(new Date(2026, 7, 12, 9, 5)), "09:05");
  });

  it("writes midnight as the day's own start", () => {
    assert.equal(timeLabel(new Date(2026, 7, 12, 0, 0)), "00:00");
  });
});
