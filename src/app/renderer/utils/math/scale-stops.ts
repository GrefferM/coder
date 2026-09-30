import type { ScaleStops } from "./interfaces";

/** A tenth of a step: slack so an inexact scale still counts as on its stop. */
const SCALE_SLACK = 0.01;

/**
 * Stops are the whole steps between the bounds, both bounds included. A computed scale is put on the stop at or below
 * it, never under the floor.
 */
export function scaleStopAtMost(wanted: number, stops: ScaleStops): number {
  if (wanted >= stops.max) {
    return stops.max;
  }

  const whole = Math.floor(wanted / stops.step + SCALE_SLACK) * stops.step;

  return whole < stops.min ? stops.min : whole;
}

/** The stop one press away; at either end the scale stays put, which disables the button. */
export function nextScaleStop(from: number, direction: number, stops: ScaleStops): number {
  if (direction > 0) {
    return Math.min(stops.max, from + stops.step);
  }

  const below = from - stops.step;

  return below + SCALE_SLACK * stops.step < stops.min ? stops.min : below;
}
