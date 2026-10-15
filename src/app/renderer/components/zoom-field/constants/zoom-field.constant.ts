import type { Point } from "../../../utils/math";

/** Starting scale and its bounds; all stand on the step, so the scale is a grid of tens. */
export const ZOOM_DEFAULT_SCALE = 1;
export const ZOOM_MIN_SCALE = 0.3;

/** Ceiling at 100%: «+» is dead there and a double click fits no further. */
export const ZOOM_MAX_SCALE = ZOOM_DEFAULT_SCALE;

/** Scale change per toolbar press or wheel notch. */
export const ZOOM_SCALE_STEP = 0.1;

/** The stops the scale may stand on. */
export const ZOOM_SCALE_STOPS = {
  min: ZOOM_MIN_SCALE,
  max: ZOOM_MAX_SCALE,
  step: ZOOM_SCALE_STEP,
};

/** Fit padding: half a sphere so outer spheres stand whole, plus half as much again off the edges. */
export const ZOOM_FIT_PADDING_PX = 120;

export const ZOOM_SCALE_PERCENT = 100;

/** Decimal places kept by scale and pan. */
export const ZOOM_SCALE_PLACES = 2;

/** Below this the press stays a click and the field is not dragged. */
export const ZOOM_DRAG_THRESHOLD_PX = 4;

/** An unmoved field; also the fallback for a place nobody noted. */
export const ZOOM_UNMOVED: Point = {
  x: 0,
  y: 0,
};
