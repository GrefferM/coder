import { SPHERE_SIZE_PX } from "../../../components/sphere/constants";
import { walkHead, walkLine } from "./walk-line";
import { walkPlaces } from "./walk-places";
import {
  WALK_ARROW_HALF_WIDTH_PX,
  WALK_ARROW_LENGTH_PX,
  WALK_COLUMN_WIDTH_PX,
  WALK_CORNER_PX,
  WALK_FIRST_COLUMN_X_PX,
  WALK_HEAD_AIR_SHARE,
  WALK_LANE_HEIGHT_PX,
  WALK_SPHERE_SCALE,
  WALK_TAIL_AIR_SHARE,
  WALK_TOP_ROW_Y_PX,
} from "../constants";
import type { Point } from "../../../utils/math";
import type { WalkDrawing, WalkLineSizes, WalkPlace } from "../interfaces";
import type { WholeStep } from "../../record";

/** The sphere's drawn radius, from which line offsets are measured. */
export const WALK_SPHERE_RADIUS_PX = (SPHERE_SIZE_PX / 2) * WALK_SPHERE_SCALE;

const LINE_SIZES: WalkLineSizes = {
  radius: WALK_SPHERE_RADIUS_PX,
  tailAir: WALK_SPHERE_RADIUS_PX * WALK_TAIL_AIR_SHARE,
  headAir: WALK_SPHERE_RADIUS_PX * WALK_HEAD_AIR_SHARE,
  corner: WALK_CORNER_PX,
  arrow: WALK_ARROW_LENGTH_PX,
  wing: WALK_ARROW_HALF_WIDTH_PX,
};

/** A turn's spot: column across, lane down from the top row. */
export function walkSpot(place: WalkPlace): Point {
  return {
    x: WALK_FIRST_COLUMN_X_PX + (place.number - 1) * WALK_COLUMN_WIDTH_PX,
    y: WALK_TOP_ROW_Y_PX + place.lane * WALK_LANE_HEIGHT_PX,
  };
}

/**
 * A pass laid out for drawing. A feed from outside the pass is not drawn; lines into one turn share its gutter and the
 * turn draws a single head.
 */
export function walkDrawing(walk: WholeStep[]): WalkDrawing {
  const places = walkPlaces(walk);
  const held = new Map(places.map((place) => [place.step.id, place]));
  const fed = places.map((place) => ({
    place,
    feeding: place.step.fromStepIds
      .map((fromId) => held.get(fromId))
      .filter((from): from is WalkPlace => from !== undefined),
  }));

  return {
    turns: places.map((place) => ({
      place,
      at: walkSpot(place),
    })),
    lines: fed.flatMap(({ place, feeding }) =>
      feeding.map((from) => ({
        id: `${from.step.id}-${place.step.id}`,
        ...walkLine(walkSpot(from), walkSpot(place), LINE_SIZES, feeding.length > 1),
      })),
    ),
    heads: fed
      .filter(({ feeding }) => feeding.length > 1)
      .map(({ place }) => ({
        id: place.step.id,
        arrow: walkHead(walkSpot(place), LINE_SIZES),
      })),
  };
}
