import { CONTROL_AT_REST_COLOR, FIRST_LEVEL_TEXT_COLOR } from "../../../../../constants";

/** Question raised on every way out of unsaved agent work. */
export const UNSAVED_AGENT_QUESTION_PREFIX = "Зберегти зміни в ";
export const UNSAVED_AGENT_QUESTION_SUFFIX = "?";
export const UNSAVED_AGENT_DECLINE_LABEL = "Не зберігати";
export const UNSAVED_AGENT_SAVE_LABEL = "Зберегти";
export const UNSAVED_AGENT_STAY_LABEL = "Лишитись тут · ESC";

/** Note naming what moved, and the per-field list. */
export const UNSAVED_AGENT_DIFF_BACKGROUND_COLOR = "#0d0f16";
export const UNSAVED_AGENT_DIFF_BORDER_RADIUS_PX = 9;
export const UNSAVED_AGENT_DIFF_PADDING = "10px 11px";
export const UNSAVED_AGENT_DIFF_GAP_PX = 5;
export const UNSAVED_AGENT_DIFF_FONT_SIZE_PX = 10.5;
export const UNSAVED_AGENT_DIFF_LABEL_COLOR = CONTROL_AT_REST_COLOR;
export const UNSAVED_AGENT_DIFF_OLD_COLOR = "#5c6478";
export const UNSAVED_AGENT_DIFF_NEW_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const UNSAVED_AGENT_DIFF_SEPARATOR = " ·";
export const UNSAVED_AGENT_DIFF_ARROW = "→";

/**
 * Letters per box line: 400px less the dialog's 16 and the block's 11 on both sides, at 10.5px mono and three 5px gaps.
 */
export const UNSAVED_AGENT_DIFF_LETTERS_MOST = 51;

/** The same box raised by «Скасувати» under the fields. */
export const UNSAVED_AGENT_DROP_QUESTION = "Точно не зберігати?";
