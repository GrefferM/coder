import { BORDER_AT_REST_COLOR, PANEL_GROUND_COLOR } from "../../../../../../constants";
import { CANVAS_TROUBLE_BACKGROUND_COLOR, CANVAS_TROUBLE_BORDER_COLOR } from "../../../../constants";

export const CANVAS_PILL_BOTTOM_PX = 24;
/** The top place: centred on the field's top edge, clear of the project badge in the left corner. */
export const CANVAS_PILL_TOP_PX = 24;
/** Never wider than the field less its side margin; a long word is ellipsised. */
export const CANVAS_PILL_MAX_WIDTH = "calc(100% - 48px)";

export const CANVAS_PILL_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const CANVAS_PILL_BORDER_COLOR = BORDER_AT_REST_COLOR;

/** Pill tones — step, done, failed. */
export const CANVAS_PILL_DONE_BORDER_COLOR = "#2c4a3a";
export const CANVAS_PILL_FAILED_BORDER_COLOR = CANVAS_TROUBLE_BORDER_COLOR;
export const CANVAS_PILL_FAILED_BACKGROUND_COLOR = CANVAS_TROUBLE_BACKGROUND_COLOR;
export const CANVAS_PILL_SHADOW = "0 14px 32px rgba(0, 0, 0, 0.45)";
export const CANVAS_PILL_BORDER_RADIUS_PX = 9;
export const CANVAS_PILL_PADDING = "9px 13px";

/** Pill type; contents inherit it. */
export const CANVAS_PILL_FONT_SIZE_PX = 9;
export const CANVAS_PILL_LETTER_SPACING_PX = 1.5;

export const CANVAS_PILL_IN_ANIMATION = "write-note-in 0.16s cubic-bezier(0.2, 0, 0, 1)";
/** A top pill drops in, as a bottom one rises. */
export const CANVAS_PILL_TOP_IN_ANIMATION = "write-note-drop-in 0.16s cubic-bezier(0.2, 0, 0, 1)";
export const CANVAS_PILL_OUT_ANIMATION = "write-note-out 0.24s ease forwards";
