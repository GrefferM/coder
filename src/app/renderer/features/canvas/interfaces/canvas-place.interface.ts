import type { Point } from "../../../utils/math";

/** Where the canvas stands: its offset and zoom. */
export interface CanvasPlace {
  pan: Point;
  scale: number;
}
