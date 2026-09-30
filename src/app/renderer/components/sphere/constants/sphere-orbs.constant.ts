/**
 * The arc of mini-spheres over a sphere. They sit on the edge of the wireframe rather than
 * between spheres, and they are an arc and not a ring: a ring would take the place the label stands in and run into
 * the links, which mostly go sideways. The top arc leaves the bottom to the label and the sides to the links.
 */
export const SPHERE_ORB_SIZE_PX = 22;
/** How far from the centre of the sphere's own box the arc stands. */
export const SPHERE_ORB_RADIUS_PX = 104;
/** How wide the arc opens, and how much of it one mini-sphere is worth while there are few of them. */
export const SPHERE_ORB_SPREAD = Math.PI * 1.15;
export const SPHERE_ORB_SPREAD_EACH = 0.42;
/** A thinner wire than the sphere's own — a circle and two arcs instead of seven by seven. */
export const SPHERE_ORB_STROKE = 1;
export const SPHERE_ORB_ELLIPSE_OPACITY = 0.62;
export const SPHERE_ORB_TILT = "rotate(-35 12 12)";
export const SPHERE_ORB_RADIUS = 11;
export const SPHERE_ORB_ELLIPSE_THIN = 4.2;
/** The filled core that makes an agent's mark a sphere of its own. */
export const SPHERE_ORB_CORE_RADIUS = 3;
export const SPHERE_ORB_FILL = "#0d0f16";
/** The порода's «+» says the count, and it is the only mini-sphere with a word in it. */
export const SPHERE_ORB_MORE_COLOR = "#dde1ee";
export const SPHERE_ORB_MORE_FONT_SIZE_PX = 9;
/**
 * The «+» wears its порода's own shape and colour, and is told apart from a mark by a dashed outline
 * and by that colour dimmed — «є ще стільки» is not a source, and must not read as one more of them.
 */
export const SPHERE_ORB_FOLD_DIM_PERCENT = 45;
export const SPHERE_ORB_FOLD_DASH = "3 3";

/**
 * Nothing on the arc moves while a call is out — no swelling, no fill, no glow. What the
 * canvas says about a call is one pill beside the sphere, and that pill is the canvas's own (`CallPill`).
 */

/**
 * The mini-sphere is pressable, and its target holds 26 px on the screen at every scale. At half scale
 * the drawn mini-sphere is 11 px and would be a coin toss to hit; the target is the same 26 it always was, by the
 * same trick that keeps the «?» at its 16. Neighbouring targets meet halfway and never overlap, because the
 * arc's own spacing is wider than this.
 */
export const SPHERE_ORB_TARGET_PX = 26;
/**
 * A declared command is a rounded square with a prompt in it — `>_` — and a server keeps the globe.
 * The corner is a part of the size rather than a number of its own, so it holds at every zoom of the canvas.
 */
export const SPHERE_ORB_SQUARE_CORNER_PART = 0.27;
export const SPHERE_ORB_SQUARE_LEAST_CORNER_PX = 4;
export const SPHERE_ORB_SQUARE_INSET = 1;
export const SPHERE_ORB_SQUARE_SIDE = 22;
export const SPHERE_ORB_SQUARE_CORNER = 6;
export const SPHERE_ORB_COMMAND_MARK = "M6 8.5 9 12l-3 3.5M12.5 15.5h5.5";
/** Under the cursor the mini-sphere takes a ring of its own colour; there is no tooltip. */
export const SPHERE_ORB_RING_PX = 2;
export const SPHERE_ORB_RING_PERCENT = 45;
