import { BORDER_AT_REST_COLOR, FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../constants";

export const FIELD_PADDING = "8px 10px";

export const FIELD_VALUE_FONT_SIZE_PX = 13;

export const FIELD_LABEL_FONT_SIZE_PX = 11;

/** Gap, in pixels, between a field's label and its box. */
export const FIELD_LABEL_GAP_PX = 5;

export const FIELD_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;

export const FIELD_VALUE_COLOR = FIRST_LEVEL_TEXT_COLOR;

export const FIELD_BACKGROUND_COLOR = "#171b26";

/**
 * What a field stands on **inside a box of the field's own colour** — a variable's block is painted the
 * field's shade, so a field left at that shade melts into it and the block reads as one flat rectangle. Sunk, the
 * field says where the typing goes and the box says where the variable begins.
 */
export const FIELD_SUNKEN_BACKGROUND_COLOR = "#0d0f16";

/** Border of a field's box at rest. */
export const FIELD_BORDER_COLOR = BORDER_AT_REST_COLOR;

export const FIELD_FOCUS_BORDER_COLOR = "#38a3ff";

export const FIELD_BORDER_RADIUS_PX = 10;

/** How much a price field steps by. */
export const FIELD_PRICE_STEP = 0.1;

/** The unit inside the box, at the quiet mark's tone. */
export const FIELD_UNIT_GAP_PX = 9;
export const FIELD_UNIT_LETTER_SPACING_PX = 1;

export const FIELD_INVALID_BORDER_COLOR = "#ff6b6b";

/**
 * The edge of a field that is not refused but warned — what stands in it will not work, and the app
 * says so standing rather than in a flash. Quieter than the refusal red, because nothing here is broken yet.
 */
export const FIELD_WARNED_BORDER_COLOR = "#4a2530";
export const FIELD_WARNED_CLASS = "field-warned";

/** Invalid border fade transition. */
export const FIELD_INVALID_TRANSITION = "border-color 0.6s";

/** How long the invalid mark holds after a save press, ms. */
export const FIELD_INVALID_MS = 2400;

/**
 * The cross that empties a field whose value is not shown in it — a key, standing behind its own hint. Without it
 * the only way to empty such a field is to leave it alone and save, which nothing on the screen says and nobody
 * guesses; with it, emptying is a press somebody makes on purpose.
 */
export const FIELD_CLEAR_LABEL = "Очистити";
export const FIELD_CLEAR_SIZE_PX = 15;
export const FIELD_CLEAR_COLOR = "#5c6478";
export const FIELD_CLEAR_LIT_COLOR = "#dde1ee";

/** A number field stands at zero at the lowest: neither a price nor a ceiling means anything below it. */
export const FIELD_NUMBER_LEAST = 0;
export const FIELD_MINUS = "-";
