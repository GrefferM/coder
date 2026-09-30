/** Stacking order of everything that floats. */

/** The canvas's own marks: link counts, zoom, bottom pills, right-click menu. */
export const CANVAS_LAYER = 1;

/** The project badge and its open list. */
export const SWITCHER_LAYER = 2;

/** The app's note along the top of the canvas (a write, an outside change, a refusal), over the badge. */
export const NOTE_LAYER = 3;

/** The run's debug projection, over the canvas and the panel. */
export const RUN_DEBUG_LAYER = 4;

/** A prompt opened for writing, over the panel it came from. */
export const PROMPT_EDITOR_LAYER = 5;

/** A question, over everything that raised it. */
export const CONFIRM_LAYER = 6;
