import { SPHERE_GRID_SEGMENTS_PER_LINE } from "./constants";
import { type Point3 } from "./interfaces";

/** The viewer-facing runs of a closed curve; fully visible is one closed run, hidden is empty. */
export function visibleRuns(pointAt: (angleRadians: number) => Point3): Point3[][] {
  const points = Array.from(
    {
      length: SPHERE_GRID_SEGMENTS_PER_LINE,
    },
    (_, index) => pointAt((index / SPHERE_GRID_SEGMENTS_PER_LINE) * 2 * Math.PI),
  );
  const visible = points.map((point) => point.z <= 0);

  if (visible.every((isVisible) => isVisible)) {
    return [[...points, points[0]]];
  }

  if (visible.every((isVisible) => !isVisible)) {
    return [];
  }

  const start = visible.findIndex(
    (isVisible, index) =>
      isVisible && !visible[(index - 1 + SPHERE_GRID_SEGMENTS_PER_LINE) % SPHERE_GRID_SEGMENTS_PER_LINE],
  );
  const orderedPoints = [...points.slice(start), ...points.slice(0, start)];
  const orderedVisible = [...visible.slice(start), ...visible.slice(0, start)];

  const runs: Point3[][] = [];
  let current: Point3[] = [];
  for (const [index, point] of orderedPoints.entries()) {
    if (orderedVisible[index]) {
      current.push(point);
    } else if (current.length) {
      runs.push(current);
      current = [];
    }
  }

  if (current.length) {
    runs.push(current);
  }

  return runs;
}
