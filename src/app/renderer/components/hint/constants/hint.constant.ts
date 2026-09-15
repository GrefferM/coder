/**
 * The app's own hint window. Not the browser's `title` — that one appears when it likes, looks like
 * nothing else here, and cannot be told anything. This one is the only hint the app has: the rail, the panel, the
 * step cards and the «?» on a sphere all take it, and `title` comes back nowhere.
 */
export const HINT_BACKGROUND_COLOR = "#171b26";
export const HINT_BORDER_COLOR = "#2c3550";
export const HINT_BORDER_RADIUS_PX = 9;
export const HINT_PADDING = "9px 11px";
export const HINT_SHADOW = "0 8px 22px rgba(0, 0, 0, 0.55)";
export const HINT_FONT_SIZE_PX = 11.5;
export const HINT_COLOR = "#dde1ee";
export const HINT_LINE_HEIGHT = 1.45;
/** The gap to the mark it is about; there is no tail — the window simply stands beside it. */
export const HINT_GAP_PX = 8;
/**
 * A line for **recognition** is cut with «…» at 260 px and never wrapped. The other kind
 * exists to let a cut line be read to the end, so it wraps by words and grows down — 320 px and three lines,
 * and no «…», because cutting there would be the very thing it came to undo.
 */
export const HINT_NAME_WIDTH_PX = 260;
export const HINT_READING_WIDTH_PX = 320;
export const HINT_READING_LINES = 3;
/**
 * It waits 0,4 s under the cursor and goes at once. Keyboard focus shows it with no wait at all — a
 * hand that came by the keyboard has already asked, and waiting would be answering slower than the question.
 */
export const HINT_DELAY_MS = 400;
/**
 * Moving from one mark to its neighbour inside 0,3 s shows the next one at once: the hand is reading the row, not
 * arriving at it, and making it wait again for every neighbour turns reading into a series of pauses.
 */
export const HINT_NEIGHBOUR_MS = 300;
