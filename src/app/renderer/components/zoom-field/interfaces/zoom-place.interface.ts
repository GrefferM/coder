import type { Point } from "../../../utils/math";

/** Where a field stands: what it is moved by, and how close it is. */
export interface ZoomPlace {
  pan: Point;
  scale: number;
}
