import { FIRST_LEVEL_TEXT_COLOR, PANEL_GROUND_COLOR, QUIET_MARK_COLOR } from "../../../../../../../constants";
import type { IconTone } from "../../../../../../../components";

/**
 * The record of a step is a sheet raised over the projection, not a column of the window — inset from the
 * three edges it touches, with a shadow and a border in the step's own colour. The field under it neither narrows nor
 * lays itself out again, so the ring stays where it was pressed.
 */
export const STEP_SHEET_WIDTH_PX = 560;
export const STEP_SHEET_INSET_PX = 20;
export const STEP_SHEET_BORDER_RADIUS_PX = 12;
export const STEP_SHEET_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const STEP_SHEET_BORDER_PERCENT = 34;
export const STEP_SHEET_BORDER_MIX_COLOR = "#262b3a";
/** With less than a sheet's width left for the graph, the sheet stops standing beside it. */
export const STEP_SHEET_GRAPH_LEAST_PX = 560;
/** The lower sheet takes the width of the field and a little over half its height. */
export const STEP_SHEET_BOTTOM_HEIGHT = "58%";
export const STEP_SHEET_BOTTOM_SHADOW = "0 -20px 46px rgba(0, 0, 0, 0.6)";

/** The head: the step's number in its own colour, whose turn it was, and the way out. */
export const STEP_SHEET_HEAD_PADDING = "11px 14px";
export const STEP_SHEET_HEAD_GAP_PX = 10;
export const STEP_SHEET_HEAD_BACKGROUND_COLOR = "#171b26";
export const STEP_SHEET_HEAD_BORDER_COLOR = "#262b3a";
export const STEP_SHEET_DOT_SIZE_PX = 8;
export const STEP_SHEET_DOT_GLOW_PX = 9;
export const STEP_SHEET_NUMBER_PREFIX = "КРОК ";
export const STEP_SHEET_NUMBER_FONT_SIZE_PX = 10;
export const STEP_SHEET_NAME_COLOR = "#e6e9f2";
export const STEP_SHEET_NAME_FONT_SIZE_PX = 13;
export const STEP_SHEET_CLOSE_LABEL = "Закрити крок";
export const STEP_SHEET_CLOSE_ICON_SIZE_PX = 12;
/** The cross is quiet until the pointer, then as bright as the name beside it. */
export const STEP_SHEET_CLOSE_TONE: IconTone = {
  rest: "#6b7490",
  lit: STEP_SHEET_NAME_COLOR,
};

/** What the turn ran on, in one mono line — its own row under the head, or beside the name in the lower sheet. */
export const STEP_SHEET_CARD_PADDING = "9px 14px";
export const STEP_SHEET_CARD_BORDER_COLOR = "#1c202c";
export const STEP_SHEET_CARD_COLOR = "#5c6478";
export const STEP_SHEET_CARD_FONT_SIZE_PX = 9;
export const STEP_SHEET_CARD_LETTER_SPACING_PX = 1.5;
export const STEP_SHEET_SEPARATOR = " · ";
/** The line under the card, in the quiet grey of the dash it explains. */
export const STEP_SHEET_CARD_GAP_PX = 5;
export const STEP_SHEET_UNKNOWN_COLOR = QUIET_MARK_COLOR;

/** Words stand in rows under mono labels, parted by a hairline — the chat's boxes are the chat's. */
export const STEP_SHEET_SAID_LABEL = "ВІДПОВІВ";
export const STEP_SHEET_BLOCK_PADDING = "13px 14px";
export const STEP_SHEET_BLOCK_GAP_PX = 6;
export const STEP_SHEET_LABEL_COLOR = QUIET_MARK_COLOR;
export const STEP_SHEET_TEXT_FONT_SIZE_PX = 12.5;
export const STEP_SHEET_TEXT_LINE_HEIGHT = 1.6;
/** What came in is another's words and stands quieter; what the turn said is its own and stands bright. */
export const STEP_SHEET_TAKEN_COLOR = "#aab3cc";
export const STEP_SHEET_ANSWER_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** The foot walks to the steps on either side and says which of them this one is. */
export const STEP_SHEET_FOOT_PADDING = "9px 14px";
export const STEP_SHEET_FOOT_GAP_PX = 10;
export const STEP_SHEET_FOOT_BACKGROUND_COLOR = "#0d0f16";
export const STEP_SHEET_FOOT_BORDER_COLOR = "#262b3a";
export const STEP_SHEET_FOOT_COLOR = "#6b7490";
/** The steps on either side: the words of the record at rest, as bright as the name under the pointer. */
export const STEP_SHEET_FOOT_TONE: IconTone = {
  rest: "#aab3cc",
  lit: STEP_SHEET_NAME_COLOR,
};
export const STEP_SHEET_FOOT_FONT_SIZE_PX = 9;
export const STEP_SHEET_FOOT_LETTER_SPACING_PX = 1.5;
export const STEP_SHEET_FOOT_ARROW_SIZE_PX = 9;
export const STEP_SHEET_FOOT_ARROW_GAP_PX = 6;
export const STEP_SHEET_FOOT_OF = " З ";
