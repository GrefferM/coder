/**
 * Where a pass is drawn, in pixels: a column per turn, a top row for turns no line passes, a lane for everything that
 * can be gone round.
 */
export const WALK_FIRST_COLUMN_X_PX = 150;
export const WALK_COLUMN_WIDTH_PX = 200;
export const WALK_TOP_ROW_Y_PX = 170;
/** A lane is measured off the sphere and its sign: 67 sphere + 26 sign + air. */
export const WALK_LANE_HEIGHT_PX = 105;
export const WALK_SPHERE_SCALE = 0.42;

/**
 * The line's own sizes; air around a sphere is a share of its rim (22 out and 30 in at an 80 px rim). Gutters are
 * derived from the head and the corner.
 */
export const WALK_TAIL_AIR_SHARE = 0.28;
export const WALK_HEAD_AIR_SHARE = 0.38;
export const WALK_CORNER_PX = 9;
export const WALK_ARROW_LENGTH_PX = 9;
export const WALK_ARROW_HALF_WIDTH_PX = 4.5;
