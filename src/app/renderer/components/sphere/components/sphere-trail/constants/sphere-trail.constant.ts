/**
 * The trail is the **third** level of loudness under a sphere — the name is the first, the model the
 * second, and this is noticed only up close. It does not brighten under the pointer the way the model line
 * does: four levels of loudness is one more than the eye reads.
 */
export const SPHERE_TRAIL_COLOR = "rgba(221, 225, 238, 0.32)";
export const SPHERE_TRAIL_GLYPH_PX = 10;
export const SPHERE_TRAIL_FONT_SIZE_PX = 9;
export const SPHERE_TRAIL_GAP_PX = 4;
export const SPHERE_TRAIL_PAIR_GAP_PX = 8;
export const SPHERE_TRAIL_STROKE = 1.6;
export const SPHERE_TRAIL_TOP_PX = 3;
/**
 * The page with a folded corner — the same silhouette the rail wears for the prompts section, and deliberately
 * without its two lines of text: at ten pixels they are three grey specks, and the trail is read by shape alone.
 */
export const SPHERE_TRAIL_PROMPT_PATHS = ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5"];
/**
 * The key, and the one number beside it — how many functions this agent can call.
 *
 * It lies flat and its teeth hang **down**, and that is the whole of what makes it a key at ten pixels. Drawn on
 * the diagonal with teeth along the shaft — the way a key is usually drawn — it came out as a ring with a stroke
 * through it: the teeth fell under a pixel and what was left read as ⚲. A silhouette this small is read by its
 * outline alone, so the outline has to be the thing.
 */
export const SPHERE_TRAIL_KEY_PATHS = ["M11 12h9", "M16 12v4", "M19.5 12v3"];
export const SPHERE_TRAIL_KEY_RING = {
  cx: 7.5,
  cy: 12,
  r: 3.5,
};
