import type { MouseEvent } from "react";
import type { Point } from "../../../utils/math";

export interface ZoomField {
  pan: Point;
  scale: number;
  isPanning: boolean;
  pointAt: (clientX: number, clientY: number) => Point;
  contentPointAt: (clientX: number, clientY: number) => Point;
  stepAround: (direction: number, at: Point) => void;
  /** Fits everything on it; `ceiling` caps the fit below the field's top scale. */
  fitAll: (points: Point[], ceiling?: number) => void;
  boxCentre: () => Point;
  grabField: (event: MouseEvent) => void;
}
