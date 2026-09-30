import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../constants";

/** Search placeholder and the matched/total separator, as "4/7". */
export const PICKER_SEARCH_PLACEHOLDER = "Пошук";
export const PICKER_MATCH_SEPARATOR = "/";

/** The closed field. */
export const PICKER_FIELD_PADDING = "8px 10px";
export const PICKER_FIELD_GAP_PX = 10;
export const PICKER_FIELD_FONT_SIZE_PX = 13;
export const PICKER_BORDER_RADIUS_PX = 10;
export const PICKER_BACKGROUND_COLOR = "#171b26";
export const PICKER_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PICKER_OPEN_BORDER_COLOR = "#38a3ff";
export const PICKER_PLACEHOLDER_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const PICKER_VALUE_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** Open list max height before it scrolls: eight rows. */
export const PICKER_LIST_MAX_HEIGHT_PX = 300;

/** List inset, so a chosen row's backdrop does not touch the edges. */
export const PICKER_LIST_PADDING_PX = 6;

/** The search row of the open list. */
export const PICKER_SEARCH_PADDING = "9px 10px";
export const PICKER_SEARCH_GAP_PX = 8;
export const PICKER_COUNT_FONT_SIZE_PX = 9;
export const PICKER_COUNT_COLOR = QUIET_MARK_COLOR;

/** List row: dot, name over note, count at the right edge. */
export const PICKER_ROW_PADDING = "9px 10px";
export const PICKER_ROW_GAP_PX = 10;
export const PICKER_ROW_TEXT_GAP_PX = 3;
export const PICKER_ROW_BORDER_RADIUS_PX = 8;
export const PICKER_ROW_CHOSEN_BACKGROUND_COLOR = "#1b1f2c";
export const PICKER_ROW_COUNT_COLOR = "#5c6478";
export const PICKER_DOT_SIZE_PX = 6;
export const PICKER_NAME_FONT_SIZE_PX = 12;
export const PICKER_NAME_COLOR = "#e6e9f2";
export const PICKER_ROW_NOTE_LETTER_SPACING_PX = 1;
export const PICKER_ROW_NOTE_COLOR = CONTROL_AT_REST_COLOR;
