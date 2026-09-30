import { HAIRLINE_COLOR, QUIET_MARK_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../../../constants";

/** Handoff row label. */
export const HANDOFF_ROW_LABEL = "Передає";
export const HANDOFF_ROW_GAP_PX = 8;
export const HANDOFF_ROW_INNER_GAP_PX = 6;
export const HANDOFF_ROW_RULE_COLOR = HAIRLINE_COLOR;
export const HANDOFF_ROW_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const HANDOFF_ROW_FONT_SIZE_PX = 9;
export const HANDOFF_ROW_LETTER_SPACING_PX = 1.5;
export const HANDOFF_ROW_ARROW_WIDTH_PX = 16;
export const HANDOFF_ROW_ARROW_HEIGHT_PX = 8;

/** The handoff did not happen: dashed rules, no colour, reason shown. */
export const HANDOFF_ROW_STOPPED_LABEL = "Не передає";
/** The person's own question that never went; the agent it was for keeps its colour. */
export const HANDOFF_ROW_NOT_SENT_LABEL = "Питання не пішло";
export const HANDOFF_ROW_STOPPED_COLOR = QUIET_MARK_COLOR;
export const HANDOFF_ROW_REASON_SEPARATOR = " · ";
