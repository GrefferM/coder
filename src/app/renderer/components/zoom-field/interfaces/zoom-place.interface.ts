import type { Point } from "../../../utils/math";

/** Where a field stands: its pan and its scale. */
export interface ZoomPlace {
  pan: Point;
  scale: number;
}
