/** The arc of mini-spheres over a sphere: an arc, not a ring, so the label's place and the sideways links stay free. */
export const SPHERE_ORB_SIZE_PX = 22;
/** Distance from the centre of the sphere's box to the arc. */
export const SPHERE_ORB_RADIUS_PX = 104;
/** Angle the arc opens by, and the share of it one mini-sphere takes while there are few. */
export const SPHERE_ORB_SPREAD = Math.PI * 1.15;
export const SPHERE_ORB_SPREAD_EACH = 0.42;
/** A thinner wire than the sphere's own. */
export const SPHERE_ORB_STROKE = 1;
export const SPHERE_ORB_ELLIPSE_OPACITY = 0.62;
export const SPHERE_ORB_TILT = "rotate(-35 12 12)";
export const SPHERE_ORB_RADIUS = 11;
export const SPHERE_ORB_ELLIPSE_THIN = 4.2;
/** The filled core that makes an agent's mark a sphere. */
export const SPHERE_ORB_CORE_RADIUS = 3;
export const SPHERE_ORB_FILL = "#0d0f16";
/** The «+» shows the count; the only mini-sphere with a word in it. */
export const SPHERE_ORB_MORE_COLOR = "#dde1ee";
export const SPHERE_ORB_MORE_FONT_SIZE_PX = 9;
/** The «+» keeps its kind's shape and colour, told apart by a dashed outline and the dimmed colour. */
export const SPHERE_ORB_FOLD_DIM_PERCENT = 45;
export const SPHERE_ORB_FOLD_DASH = "3 3";

/** Nothing on the arc moves while a call is out; the canvas shows a call as one pill beside the sphere (`CallPill`). */

/** Pressable target, px, held at every scale; neighbouring targets meet halfway without overlapping. */
export const SPHERE_ORB_TARGET_PX = 26;
/**
 * A declared command is a rounded square with a prompt (`>_`); the corner is a fraction of the size, so it holds at
 * every zoom.
 */
export const SPHERE_ORB_SQUARE_CORNER_PART = 0.27;
export const SPHERE_ORB_SQUARE_LEAST_CORNER_PX = 4;
export const SPHERE_ORB_SQUARE_INSET = 1;
export const SPHERE_ORB_SQUARE_SIDE = 22;
export const SPHERE_ORB_SQUARE_CORNER = 6;
export const SPHERE_ORB_COMMAND_MARK = "M6 8.5 9 12l-3 3.5M12.5 15.5h5.5";
/** Ring of the mini-sphere's own colour under the cursor; no tooltip. */
export const SPHERE_ORB_RING_PX = 2;
export const SPHERE_ORB_RING_PERCENT = 45;
