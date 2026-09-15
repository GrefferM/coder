import type { Point } from "./interfaces";
import { FREE_PLACE_CLEARANCE_PX, FREE_PLACE_STEP_PX } from "./constants";

/** The wanted point, or the first free one down and to the right of it. */
export function freePlaceNear(wanted: Point, taken: Point[]): Point {
  let place = wanted;

  while (taken.some((other) => Math.hypot(other.x - place.x, other.y - place.y) < FREE_PLACE_CLEARANCE_PX)) {
    place = {
      x: place.x + FREE_PLACE_STEP_PX,
      y: place.y + FREE_PLACE_STEP_PX,
    };
  }

  return place;
}
