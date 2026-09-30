import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../../../constants";

/** Closed provider row: lit dot and full strength when set up, dim ring when not. */
export const PROVIDER_ROW_PADDING = "11px 12px";
export const PROVIDER_ROW_GAP_PX = 9;
export const PROVIDER_ROW_BORDER_RADIUS_PX = 10;
export const PROVIDER_ROW_BACKGROUND_COLOR = "#171b26";
export const PROVIDER_ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROVIDER_ROW_EMPTY_BORDER_COLOR = "#1c202c";
export const PROVIDER_ROW_EMPTY_OPACITY = 0.65;
export const PROVIDER_ROW_NAME_COLOR = "#e6e9f2";
export const PROVIDER_ROW_EMPTY_NAME_COLOR = CONTROL_AT_REST_COLOR;
export const PROVIDER_ROW_NAME_FONT_SIZE_PX = 13;
export const PROVIDER_ROW_NAME_FONT_WEIGHT = 500;
export const PROVIDER_ROW_FACTS_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const PROVIDER_ROW_EMPTY_FACTS_COLOR = QUIET_MARK_COLOR;
export const PROVIDER_ROW_FACTS_LETTER_SPACING_PX = 1;
export const PROVIDER_ROW_FACTS_GAP_PX = 3;
export const PROVIDER_ROW_DOT_SIZE_PX = 8;
export const PROVIDER_ROW_DOT_COLOR = "#4ade80";
export const PROVIDER_ROW_DOT_GLOW_PX = 7;
export const PROVIDER_ROW_EMPTY_DOT_BORDER = "1.4px solid #3a4258";
/** Local provider set up but not running: dot present, no glow. */
export const PROVIDER_ROW_SILENT_DOT_COLOR = BROKEN_COLOR;
export const PROVIDER_ROW_CHEVRON_SIZE_PX = 12;
export const PROVIDER_ROW_CHEVRON_COLOR = "#5c6478";
export const PROVIDER_ROW_EMPTY_CHEVRON_COLOR = "#3a4258";
export const PROVIDER_ROW_OPEN_LABEL = "Відкрити провайдера";
