import { type Point3 } from "./interfaces";

/** The SVG path `d` string for a run of points, each shifted by `radius` on both axes into a square at (0, 0). */
export function gridLinePath(points: Point3[], radius: number): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x + radius},${point.y + radius}`).join(" ");
}
