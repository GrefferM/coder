/**
 * Where a pass is drawn, in pixels — a turn to a column, the top row for the turns no line goes
 * past, a lane for everything that can be gone round. The spheres are drawn small.
 */
export const WALK_FIRST_COLUMN_X_PX = 150;
export const WALK_COLUMN_WIDTH_PX = 200;
export const WALK_TOP_ROW_Y_PX = 170;
/** A lane is measured off the sphere with its sign: 67 sphere + 26 sign + air. */
export const WALK_LANE_HEIGHT_PX = 105;
export const WALK_SPHERE_SCALE = 0.42;

/**
 * The line's own sizes. The air around a sphere is in shares of its rim — the canvas's own 22 out and 30 in
 * at a rim of 80 px. The gutters are not written here: they are counted off these, the head and the corner.
 */
export const WALK_TAIL_AIR_SHARE = 0.28;
export const WALK_HEAD_AIR_SHARE = 0.38;
export const WALK_CORNER_PX = 9;
export const WALK_ARROW_LENGTH_PX = 9;
export const WALK_ARROW_HALF_WIDTH_PX = 4.5;
