import type { ScaleStops } from "./interfaces";

/** A tenth of a step, so an inexactly-computed scale still counts as standing on its stop. */
const SCALE_SLACK = 0.01;

/**
 * The stops a scale may stand on are the whole steps between its bounds, and both bounds stand on a step
 * themselves — 30, 40 … 100 on the canvas, 50 … 150 in the projection. A scale worked out by arithmetic is put on the
 * stop at or below it, and never under the floor.
 */
export function scaleStopAtMost(wanted: number, stops: ScaleStops): number {
  if (wanted >= stops.max) {
    return stops.max;
  }

  const whole = Math.floor(wanted / stops.step + SCALE_SLACK) * stops.step;

  return whole < stops.min ? stops.min : whole;
}

/** The stop one press away; at either end the scale stays put, and that is what deadens the button. */
export function nextScaleStop(from: number, direction: number, stops: ScaleStops): number {
  if (direction > 0) {
    return Math.min(stops.max, from + stops.step);
  }

  const below = from - stops.step;

  return below + SCALE_SLACK * stops.step < stops.min ? stops.min : below;
}
