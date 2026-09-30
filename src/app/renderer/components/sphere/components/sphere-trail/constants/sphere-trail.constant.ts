/** The third, quietest loudness level under a sphere; does not brighten under the pointer. */
export const SPHERE_TRAIL_COLOR = "rgba(221, 225, 238, 0.32)";
export const SPHERE_TRAIL_GLYPH_PX = 10;
export const SPHERE_TRAIL_FONT_SIZE_PX = 9;
export const SPHERE_TRAIL_GAP_PX = 4;
export const SPHERE_TRAIL_PAIR_GAP_PX = 8;
export const SPHERE_TRAIL_STROKE = 1.6;
export const SPHERE_TRAIL_TOP_PX = 3;
/**
 * The page with a folded corner, the prompts section's silhouette without its text lines, which are specks at ten
 * pixels.
 */
export const SPHERE_TRAIL_PROMPT_PATHS = ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5"];
/**
 * The key and its number of callable functions; lies flat with teeth hanging down, the only outline that reads as a key
 * at ten pixels.
 */
export const SPHERE_TRAIL_KEY_PATHS = ["M11 12h9", "M16 12v4", "M19.5 12v3"];
export const SPHERE_TRAIL_KEY_RING = {
  cx: 7.5,
  cy: 12,
  r: 3.5,
};
