import type { Point } from "../../../utils/math";

/** Where the canvas stands: what it is moved by and how close it is. */
export interface CanvasPlace {
  pan: Point;
  scale: number;
}
