import { describe, expect, it } from "vitest";
import { visibleRuns } from "./visible-runs";

describe("visibleRuns", () => {
  it("closes the loop on itself when every point faces the viewer", () => {
    const runs = visibleRuns((angle) => ({
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: -1,
    }));

    expect(runs).toHaveLength(1);
    expect(runs[0].at(0)).toEqual(runs[0].at(-1));
  });

  it("finds nothing when every point faces away from the viewer", () => {
    const runs = visibleRuns((angle) => ({
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: 1,
    }));

    expect(runs).toEqual([]);
  });

  it("splits off a single open run for a curve that's visible on exactly half", () => {
    const runs = visibleRuns((angle) => ({
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: Math.cos(angle),
    }));

    expect(runs).toHaveLength(1);
    for (const point of runs[0]) {
      expect(point.z).toBeLessThanOrEqual(0);
    }
  });
});
