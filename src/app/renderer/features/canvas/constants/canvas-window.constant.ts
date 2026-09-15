/**
 * How long what a mark raised waits after the pointer leaves it. The way into the
 * window is across the gap above the mark, so closing at once would mean the window could never be reached — and
 * waiting for a click instead would leave it hanging over a canvas the hand has already left.
 */
export const CANVAS_WINDOW_AWAY_MS = 180;
