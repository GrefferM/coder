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
import type { WalkDrawing, WalkGrid, WalkKnot, WalkPlace } from "../interfaces";

/** The sphere's drawn radius, from which line offsets are measured. */
export const WALK_SPHERE_RADIUS_PX = (SPHERE_SIZE_PX / 2) * WALK_SPHERE_SCALE;

/** The projection's own grid (24a). */
const PROJECTION_GRID: WalkGrid = {
  firstColumnX: WALK_FIRST_COLUMN_X_PX,
  columnWidth: WALK_COLUMN_WIDTH_PX,
  topRowY: WALK_TOP_ROW_Y_PX,
  laneHeight: WALK_LANE_HEIGHT_PX,
  line: {
    radius: WALK_SPHERE_RADIUS_PX,
    tailAir: WALK_SPHERE_RADIUS_PX * WALK_TAIL_AIR_SHARE,
    headAir: WALK_SPHERE_RADIUS_PX * WALK_HEAD_AIR_SHARE,
    corner: WALK_CORNER_PX,
    arrow: WALK_ARROW_LENGTH_PX,
    wing: WALK_ARROW_HALF_WIDTH_PX,
  },
};

/** A turn's spot on a grid: column across, lane down from the top row. */
export function walkSpot<TStep extends WalkKnot>(place: WalkPlace<TStep>, grid: WalkGrid = PROJECTION_GRID): Point {
  return {
    x: grid.firstColumnX + (place.number - 1) * grid.columnWidth,
    y: grid.topRowY + place.lane * grid.laneHeight,
  };
}

/**
 * A pass laid out for drawing on a grid, the projection's own unless another is given. A feed from outside the pass is
 * not drawn; lines into one turn share its gutter and the turn draws a single head.
 */
export function walkDrawing<TStep extends WalkKnot>(
  walk: TStep[],
  grid: WalkGrid = PROJECTION_GRID,
): WalkDrawing<TStep> {
  const places = walkPlaces(walk);
  const held = new Map(places.map((place) => [place.step.id, place]));
  const fed = places.map((place) => ({
    place,
    feeding: place.step.fromStepIds
      .map((fromId) => held.get(fromId))
      .filter((from): from is WalkPlace<TStep> => from !== undefined),
  }));

  return {
    turns: places.map((place) => ({
      place,
      at: walkSpot(place, grid),
    })),
    lines: fed.flatMap(({ place, feeding }) =>
      feeding.map((from) => ({
        id: `${from.step.id}-${place.step.id}`,
        fromId: from.step.id,
        toId: place.step.id,
        ...walkLine(walkSpot(from, grid), walkSpot(place, grid), grid.line, feeding.length > 1),
      })),
    ),
    heads: fed
      .filter(({ feeding }) => feeding.length > 1)
      .map(({ place }) => ({
        id: place.step.id,
        arrow: walkHead(walkSpot(place, grid), grid.line),
      })),
  };
}
