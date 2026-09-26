/** Everything that floats, in the order it stands — one scale, in one place. */

/** The canvas's own marks: the link counts, the zoom, the pills along the bottom, a right-click menu. */
export const CANVAS_LAYER = 1;

/** The project badge and its open list, over the canvas's marks. */
export const SWITCHER_LAYER = 2;

/**
 * The app's own word along the top of the canvas — a write, a change from outside, a refusal. It stands over the
 * badge: a note the badge covered would lose its mark and its first words, and it is gone again in seconds.
 */
export const NOTE_LAYER = 3;

/** The debug projection of a run, over the whole field the canvas and the panel stand in. */
export const RUN_DEBUG_LAYER = 4;

/** A prompt opened for writing, over the panel it was opened from. */
export const PROMPT_EDITOR_LAYER = 5;

/** A question, over everything that raised it. */
export const CONFIRM_LAYER = 6;
