import type { Point } from "../../../../../../utils/math";

/** Where the sphere is drawn and how large: everything the canvas's scale decides about it. */
export interface SpherePlace {
  /** Its own place, or the pointer's while it is being dragged. */
  at: Point;
  /** The canvas's scale; the arc's targets keep 26 px on screen while the drawing shrinks. */
  scale: number;
  markScale: number;
  isDrawnSmall: boolean;
  /** The dragged sphere must not catch the pointer it follows. */
  isDragged: boolean;
}
