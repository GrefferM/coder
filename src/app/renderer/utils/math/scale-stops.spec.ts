import { describe, expect, it } from "vitest";
import { nextScaleStop, scaleStopAtMost } from "./scale-stops";

/** The canvas's stops: a grid of tens, with floor and ceiling on it. */
const STOPS = {
  min: 0.3,
  max: 1,
  step: 0.1,
};

/** The projection's own — different ends, the same step. */
const OWN = {
  min: 0.5,
  max: 1.5,
  step: 0.1,
};

describe("nextScaleStop", () => {
  it("walks whole steps, and off the floor like off any other stop", () => {
    expect(nextScaleStop(0.3, 1, STOPS)).toBeCloseTo(0.4);
    expect(nextScaleStop(0.7, 1, STOPS)).toBeCloseTo(0.8);
    expect(nextScaleStop(0.7, -1, STOPS)).toBeCloseTo(0.6);
    expect(nextScaleStop(0.4, -1, STOPS)).toBeCloseTo(0.3);
  });

  it("stays at either end, which is what makes the button dead", () => {
    expect(nextScaleStop(0.3, -1, STOPS)).toBeCloseTo(0.3);
    expect(nextScaleStop(1, 1, STOPS)).toBeCloseTo(1);
  });

  it("keeps its footing where the step divides into a bound inexactly", () => {
    // A tenth is inexact in binary, so a scale can sit a hair off its stop; the slack lets a press near a bound move.
    expect(nextScaleStop(0.30000000000000004, -1, STOPS)).toBeCloseTo(0.3);
    expect(nextScaleStop(0.30000000000000004, 1, STOPS)).toBeCloseTo(0.4);
  });

  it("walks the projection's ends the same way, since only the ends differ", () => {
    expect(nextScaleStop(0.5, 1, OWN)).toBeCloseTo(0.6);
    expect(nextScaleStop(0.5, -1, OWN)).toBeCloseTo(0.5);
    expect(nextScaleStop(1.5, 1, OWN)).toBeCloseTo(1.5);
  });
});

describe("scaleStopAtMost", () => {
  it("puts a scale worked out by arithmetic on the stop below it", () => {
    expect(scaleStopAtMost(0.87, STOPS)).toBeCloseTo(0.8);
  });

  it("leaves a scale that already stands on a stop where it is", () => {
    expect(scaleStopAtMost(0.6, STOPS)).toBeCloseTo(0.6);
  });

  it("never goes under the floor, however small the arithmetic came out", () => {
    expect(scaleStopAtMost(0.29, STOPS)).toBeCloseTo(0.3);
    expect(scaleStopAtMost(0.01, STOPS)).toBeCloseTo(0.3);
  });

  it("stops at the ceiling", () => {
    expect(scaleStopAtMost(5, STOPS)).toBeCloseTo(1);
  });
});
