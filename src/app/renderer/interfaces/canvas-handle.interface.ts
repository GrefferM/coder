import type { Point } from "../utils/math";

/** Lets `MainPage` ask for the canvas middle when no point was clicked. */
export interface CanvasHandle {
  centre: () => Point;
}
