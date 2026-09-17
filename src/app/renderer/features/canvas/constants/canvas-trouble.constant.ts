/**
 * The trouble tone on the canvas, worn by anything the canvas says has gone wrong — a pill under a sphere, the
 * word under an end that names nobody. One pair of tones, so two things about one trouble never differ.
 */
export const CANVAS_TROUBLE_BORDER_COLOR = "#4a2530";
export const CANVAS_TROUBLE_BACKGROUND_COLOR = "#1f1a20";

/** How much of an id stands where a name would be: the head of it, which is what a file is read by. */
export const CANVAS_DEAD_ID_LENGTH = 8;

/**
 * How far down and to the right of the live end a dead one starts looking for its place, in pixels. It is not
 * an agent the person put there, so it stands off on its own: far enough that the dashed circle and the two
 * words under it never crowd the name and the pills of the sphere the line hangs from.
 */
export const CANVAS_DEAD_PLACE_AWAY_PX = 260;
