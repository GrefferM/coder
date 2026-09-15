import type { Point } from "./interfaces";

/** Whether a pointer has left the circle of `thresholdPx` around where it was pressed — a drag, not a click. */
export function hasLeft(from: Point, to: Point, thresholdPx: number): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) >= thresholdPx;
}
