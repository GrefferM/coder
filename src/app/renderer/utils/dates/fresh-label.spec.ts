import { describe, expect, it } from "vitest";
import { freshLabel } from "./fresh-label";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = new Date("2026-03-19T14:00:00Z").getTime();

const ago = (span: number) => freshLabel(NOW - span, NOW);

describe("freshLabel", () => {
  it("says «щойно» for the whole first minute, and never a number of seconds", () => {
    // Seconds belong to the clock of what is running now, and nothing on this scale counts them.
    expect(ago(0)).toBe("щойно");
    expect(ago(59 * SECOND)).toBe("щойно");
  });

  it("rounds down at every boundary, because rounding up promises what has not happened", () => {
    expect(ago(MINUTE - 1)).toBe("щойно");
    expect(ago(MINUTE)).toBe("1 хв тому");
    expect(ago(HOUR - 1)).toBe("59 хв тому");
    expect(ago(HOUR)).toBe("1 год тому");
    expect(ago(DAY - 1)).toBe("23 год тому");
    expect(ago(DAY)).toBe("вчора");
    expect(ago(2 * DAY - 1)).toBe("вчора");
    expect(ago(2 * DAY)).toBe("2 дні тому");
  });

  it("counts «вчора» in hours and not in turns of the calendar", () => {
    // 24 to 47 hours, and no exception — a row an hour before midnight does not become «вчора» at it.
    expect(ago(47 * HOUR)).toBe("вчора");
    expect(ago(48 * HOUR)).toBe("2 дні тому");
  });

  it("holds to the Ukrainian forms of the days it can say", () => {
    expect(ago(4 * DAY)).toBe("4 дні тому");
    expect(ago(5 * DAY)).toBe("5 днів тому");
    expect(ago(6 * DAY)).toBe("6 днів тому");
  });

  it("says the date from the seventh day, since a blurred week is worth less than a fact", () => {
    expect(ago(7 * DAY)).toBe("12 бер.");
    expect(ago(30 * DAY)).toBe("17 лют.");
  });

  it("writes the year only where it says something", () => {
    expect(freshLabel(new Date("2025-03-12T14:00:00Z").getTime(), NOW)).toBe("12 бер. 2025");
  });

  it("takes a moment still to come as «щойно» rather than counting backwards", () => {
    // Clocks drift and machines disagree; a row saying «-3 хв тому» would be telling on them and helping nobody.
    expect(ago(-HOUR)).toBe("щойно");
  });
});
