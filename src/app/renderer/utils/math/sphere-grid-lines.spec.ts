import { describe, expect, it } from "vitest";
import { sphereGridLines } from "./sphere-grid-lines";

function pathPoints(path: string): number[][] {
  return path
    .split(/[ML]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.split(",").map(Number));
}

describe("sphereGridLines", () => {
  it("always includes the silhouette circle first", () => {
    const [boundary] = sphereGridLines(7, 10, 35);
    const points = pathPoints(boundary.path);

    expect(points.at(0)).toEqual(points.at(-1));
    for (const [x, y] of points) {
      expect(Math.hypot(x - 10, y - 10)).toBeCloseTo(10, 1);
    }
  });

  it("keeps every drawn point within the sphere's own bounding box", () => {
    const lines = sphereGridLines(7, 10, 35);

    for (const line of lines) {
      for (const [x, y] of pathPoints(line.path)) {
        expect(x).toBeGreaterThanOrEqual(-0.01);
        expect(x).toBeLessThanOrEqual(20.01);
        expect(y).toBeGreaterThanOrEqual(-0.01);
        expect(y).toBeLessThanOrEqual(20.01);
      }
    }
  });

  it("draws every parallel as a flat chord when there's no tilt", () => {
    const lines = sphereGridLines(3, 10, 0);
    const parallels = lines.slice(1 + 3);

    for (const parallel of parallels) {
      const ys = pathPoints(parallel.path).map(([, y]) => y);
      for (const y of ys) expect(y).toBeCloseTo(ys[0]);
    }
  });

  it("keeps every parallel in the grid when there's no tilt", () => {
    const lines = sphereGridLines(7, 10, 0);

    expect(lines).toHaveLength(1 + 7 + 7);
  });

  it("culls the parallel closest to the far pole once tilted enough", () => {
    const lines = sphereGridLines(7, 10, 35);

    expect(lines.length).toBeLessThan(1 + 7 + 7);
  });
});
