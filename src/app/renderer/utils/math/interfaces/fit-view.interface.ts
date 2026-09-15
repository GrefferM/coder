import type { Point } from "./point.interface";

/** The box a graph is fitted into — the canvas's own, in screen pixels. */
export interface FitBox {
  width: number;
  height: number;
}

/** Canvas scale and pan after fitting the graph. */
export interface FitView {
  scale: number;
  pan: Point;
}
