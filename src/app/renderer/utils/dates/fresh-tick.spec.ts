import { describe, expect, it } from "vitest";
import { freshTick } from "./fresh-tick";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = new Date("2026-03-19T14:00:00Z").getTime();

const after = (span: number) => freshTick(NOW - span, NOW);

describe("freshTick", () => {
  it("re-reads a line counting in minutes every minute", () => {
    expect(after(0)).toBe(MINUTE);
    expect(after(59 * MINUTE)).toBe(MINUTE);
  });

  it("re-reads a line counting in hours or days every hour", () => {
    expect(after(HOUR)).toBe(HOUR);
    expect(after(3 * DAY)).toBe(HOUR);
    expect(after(6 * DAY + 23 * HOUR)).toBe(HOUR);
  });

  it("never re-reads a line that says a date, since a date does not go anywhere", () => {
    expect(after(7 * DAY)).toBeNull();
    expect(after(400 * DAY)).toBeNull();
  });

  it("beats by the minute for a moment still to come, rather than not at all", () => {
    // A future time reads «щойно» and must start counting once overtaken.
    expect(after(-HOUR)).toBe(MINUTE);
  });
});
