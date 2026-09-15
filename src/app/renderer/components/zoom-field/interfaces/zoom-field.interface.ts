import type { MouseEvent } from "react";
import type { Point } from "../../../utils/math";

/** A pan-and-zoom field as its surface holds it: where it stands, and every way of moving it. */
export interface ZoomField {
  pan: Point;
  scale: number;
  isPanning: boolean;
  pointAt: (clientX: number, clientY: number) => Point;
  contentPointAt: (clientX: number, clientY: number) => Point;
  stepAround: (direction: number, at: Point) => void;
  /** Fits the whole of what stands on it; `ceiling` holds the fit below the field's top scale where asked. */
  fitAll: (points: Point[], ceiling?: number) => void;
  boxCentre: () => Point;
  grabField: (event: MouseEvent) => void;
}
