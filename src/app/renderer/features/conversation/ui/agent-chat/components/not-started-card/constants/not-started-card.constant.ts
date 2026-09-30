import type { IconTone } from "../../../../../../../components";
import { FALLEN_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../../constants";

/** Stands where the turn would have been; pink like a stop, but nothing was tried. */
export const NOT_STARTED_CARD_GAP_PX = 9;
export const NOT_STARTED_CARD_PADDING_PX = 12;
export const NOT_STARTED_CARD_BORDER_RADIUS_PX = 10;
export const NOT_STARTED_CARD_BACKGROUND_COLOR = "#1f1a20";
export const NOT_STARTED_CARD_BORDER_COLOR = "#4a2530";

export const NOT_STARTED_CARD_HEAD_GAP_PX = 8;
export const NOT_STARTED_CARD_ACCENT_COLOR = FALLEN_COLOR;
export const NOT_STARTED_CARD_ICON_SIZE_PX = 14;
export const NOT_STARTED_CARD_ICON_WIDTH = 2;
export const NOT_STARTED_CARD_TITLE_FONT_SIZE_PX = 12.5;

export const NOT_STARTED_CARD_FOOT_GAP_PX = 12;
/** The card's act: first level at rest, the family's accent under the pointer. */
export const NOT_STARTED_CARD_ACT_TONE: IconTone = {
  rest: "#dde1ee",
  lit: NOT_STARTED_CARD_ACCENT_COLOR,
};

/** The breakdown of what would have gone, under the sentence giving the amount. */
export const NOT_STARTED_CARD_BREAKDOWN_BACKGROUND_COLOR = "#0d0f16";
export const NOT_STARTED_CARD_BREAKDOWN_BORDER_RADIUS_PX = 9;
export const NOT_STARTED_CARD_BREAKDOWN_PADDING = "11px 12px";
export const NOT_STARTED_CARD_BREAKDOWN_GAP_PX = 6;
export const NOT_STARTED_CARD_BREAKDOWN_ROW_GAP_PX = 10;
export const NOT_STARTED_CARD_BREAKDOWN_FONT_SIZE_PX = 10.5;
export const NOT_STARTED_CARD_BREAKDOWN_LABEL_COLOR = "#5c6478";
export const NOT_STARTED_CARD_BREAKDOWN_VALUE_COLOR = "#aab3cc";
export const NOT_STARTED_CARD_SUM_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const NOT_STARTED_CARD_SUM_PADDING_PX = 6;
export const NOT_STARTED_CARD_SUM_BORDER = "1px dashed #2c3341";
export const NOT_STARTED_CARD_NO_RETRY_LINE_HEIGHT = 1.7;
