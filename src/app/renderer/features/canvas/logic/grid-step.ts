import { CANVAS_GRID_STEP_PX, CANVAS_WIDE_GRID_SCALE } from "../constants";

/** The distance between grid dots at this zoom; below the wide scale every second dot is dropped. */
export function gridStep(scale: number): number {
  return CANVAS_GRID_STEP_PX * scale * (scale < CANVAS_WIDE_GRID_SCALE ? 2 : 1);
}
