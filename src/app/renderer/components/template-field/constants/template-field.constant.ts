import {
  BORDER_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  INTERACTION_REST_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../constants";

/** Slot pill on the backdrop under the input; its padding is cancelled by an equal negative margin. */
export const TEMPLATE_FIELD_SLOT_COLOR = "#38a3ff";
export const TEMPLATE_FIELD_SLOT_BACKGROUND_COLOR = "rgba(56, 163, 255, 0.16)";
export const TEMPLATE_FIELD_SLOT_BORDER_RADIUS_PX = 4;
export const TEMPLATE_FIELD_SLOT_PADDING = "1px 4px";
export const TEMPLATE_FIELD_SLOT_MARGIN = "0 -4px";

/** Field background, a step darker than a plain field's. */
export const TEMPLATE_FIELD_BACKGROUND_COLOR = "#0d0f16";
export const TEMPLATE_FIELD_PADDING = "9px 10px";
export const TEMPLATE_FIELD_FONT_SIZE_PX = 12;
export const TEMPLATE_FIELD_LINE_HEIGHT = 1.6;

/** The list an opening brace opens — declared names, used ones marked. */
export const TEMPLATE_FIELD_LIST_WIDTH_PX = 210;
export const TEMPLATE_FIELD_LIST_TOP_GAP_PX = 5;
export const TEMPLATE_FIELD_LIST_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const TEMPLATE_FIELD_LIST_BORDER_COLOR = "#2c3550";
export const TEMPLATE_FIELD_LIST_BORDER_RADIUS_PX = 9;
export const TEMPLATE_FIELD_LIST_SHADOW = "0 18px 40px rgba(0, 0, 0, 0.55)";
export const TEMPLATE_FIELD_LIST_MAX_HEIGHT_PX = 168;
export const TEMPLATE_FIELD_OPTION_PADDING = "7px 9px";
export const TEMPLATE_FIELD_OPTION_GAP_PX = 8;
export const TEMPLATE_FIELD_OPTION_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const TEMPLATE_FIELD_OPTION_NAME_FONT_SIZE_PX = 11;
export const TEMPLATE_FIELD_OPTION_META_FONT_SIZE_PX = 8.5;
export const TEMPLATE_FIELD_OPTION_TYPE_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const TEMPLATE_FIELD_OPTION_TYPE_PADDING = "1px 5px";
export const TEMPLATE_FIELD_OPTION_TYPE_BORDER_RADIUS_PX = 4;
export const TEMPLATE_FIELD_OPTION_TYPE_BACKGROUND_COLOR = INTERACTION_REST_BACKGROUND_COLOR;

/**
 * A name already in the line wears the lit ground, and its type chip steps up with it — at the
 * list's own ground the chip said nothing.
 */
export const TEMPLATE_FIELD_OPTION_USED_BACKGROUND_COLOR = INTERACTION_HOVER_BACKGROUND_COLOR;
export const TEMPLATE_FIELD_OPTION_USED_TYPE_BACKGROUND_COLOR = BORDER_AT_REST_COLOR;
export const TEMPLATE_FIELD_OPTION_USED_TYPE_COLOR = INTERACTION_REST_TEXT_COLOR;
export const TEMPLATE_FIELD_OPTION_USED_COLOR = QUIET_MARK_COLOR;
export const TEMPLATE_FIELD_OPTION_USED_LABEL = "УЖЕ В РЯДКУ";
export const TEMPLATE_FIELD_LIST_EMPTY_LABEL = "параметрів ще немає";
export const TEMPLATE_FIELD_LIST_EMPTY_COLOR = "#5c6478";

export const TEMPLATE_FIELD_SLOT_CLOSE = "}";
