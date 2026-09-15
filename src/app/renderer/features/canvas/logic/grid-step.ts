import { CANVAS_GRID_STEP_PX, CANVAS_WIDE_GRID_SCALE } from "../constants";

/**
 * The distance between two dots of the grid at this zoom. Far out the dots would crowd into a texture, so
 * below the wide scale every second one is dropped and the grid keeps reading as a grid.
 */
export function gridStep(scale: number): number {
  return CANVAS_GRID_STEP_PX * scale * (scale < CANVAS_WIDE_GRID_SCALE ? 2 : 1);
}
