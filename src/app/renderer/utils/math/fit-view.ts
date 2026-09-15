import { scaleStopAtMost } from "./scale-stops";
import type { FitBox, FitView, Point, ScaleStops } from "./interfaces";

/** Fits the graph into the window at the largest stop where it fits with `padding`; empty gives `null`. */
export function fitView(points: Point[], box: FitBox, stops: ScaleStops, padding: number): FitView | null {
  if (points.length === 0 || box.width <= 0 || box.height <= 0) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const width = right - left + padding * 2;
  const height = bottom - top + padding * 2;
  const scale = scaleStopAtMost(Math.min(box.width / width, box.height / height), stops);

  return {
    scale,
    pan: {
      x: box.width / 2 - ((left + right) / 2) * scale,
      y: box.height / 2 - ((top + bottom) / 2) * scale,
    },
  };
}
