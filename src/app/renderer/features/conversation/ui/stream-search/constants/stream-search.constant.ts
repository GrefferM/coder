import { FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../constants";

/** The field stands over the stream, under the band, with no rule of its own and space on every side. */
export const STREAM_SEARCH_STRIP_PADDING = "14px 16px";
export const STREAM_SEARCH_GAP_PX = 8;
export const STREAM_SEARCH_PADDING = "8px 10px";
export const STREAM_SEARCH_BORDER_RADIUS_PX = 9;
export const STREAM_SEARCH_BACKGROUND_COLOR = "#171b26";
export const STREAM_SEARCH_BORDER_COLOR = "#262b3a";
export const STREAM_SEARCH_LIT_BORDER_COLOR = "#2c3550";
export const STREAM_SEARCH_ICON_SIZE_PX = 13;
export const STREAM_SEARCH_ICON_STROKE = "2";
export const STREAM_SEARCH_ICON_COLOR = "#5c6478";
export const STREAM_SEARCH_FONT_SIZE_PX = 12;
export const STREAM_SEARCH_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const STREAM_SEARCH_COUNT_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const STREAM_SEARCH_COUNT_FONT_SIZE_PX = 9;
export const STREAM_SEARCH_COUNT_LETTER_SPACING_PX = 1;

/**
 * The count runs from the freshest, which stands at the bottom, so **up** is the next match and **down** the one
 * before: the arrow points where the stream will go, not where the number will.
 */
export const STREAM_SEARCH_STEP_NEXT_LABEL = "Наступний збіг";
export const STREAM_SEARCH_STEP_PREVIOUS_LABEL = "Попередній збіг";
export const STREAM_SEARCH_STEP_SIZE_PX = 20;
export const STREAM_SEARCH_STEP_RADIUS_PX = 5;
export const STREAM_SEARCH_STEP_ICON_SIZE_PX = 12;
export const STREAM_SEARCH_STEP_ICON_STROKE = "2";
export const STREAM_SEARCH_STEP_GAP_PX = 2;
export const STREAM_SEARCH_STEP_COLOR = "#5c6478";
export const STREAM_SEARCH_STEP_LIT_COLOR = FIRST_LEVEL_TEXT_COLOR;
/** Nothing found, so there is nowhere to walk: the arrows dim to unpressable and keep their place. */
export const STREAM_SEARCH_STEP_SPENT_COLOR = "#333a4d";
export const STREAM_SEARCH_STEP_LIT_BACKGROUND_COLOR = "#1b1f2c";
export const STREAM_SEARCH_STEP_DOWN_PATH = "M6 9l6 6 6-6";
export const STREAM_SEARCH_STEP_UP_PATH = "M6 15l6-6 6 6";

/** The word is taken out of the field by a cross of its own; it stands only while there is a word. */
export const STREAM_SEARCH_CLEAR_LABEL = "Прибрати слово";
export const STREAM_SEARCH_CLEAR_PATH = "M6 6l12 12M18 6L6 18";
export const STREAM_SEARCH_CLEAR_ICON_SIZE_PX = 11;
export const STREAM_SEARCH_CLEAR_ICON_STROKE = "2.2";
