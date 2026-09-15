import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
} from "../../../../../../../constants";

/** One call, folded into a line; the same block a step of the projection opens. */
export const CALL_ROW_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const CALL_ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const CALL_ROW_OPEN_BORDER_COLOR = "#2c3550";
export const CALL_ROW_BORDER_RADIUS_PX = 8;
export const CALL_ROW_PADDING = "7px 9px";
export const CALL_ROW_GAP_PX = 6;
export const CALL_ROW_HEAD_GAP_PX = 8;

export const CALL_ROW_MARK_SIZE_PX = 6;
export const CALL_ROW_MARK_STILL_RADIUS_PX = 1;
export const CALL_ROW_MARK_STILL_COLOR = "#6b7490";
/** While the call is out its mark takes the agent's colour and breathes; that, the word and the seconds say it runs. */
export const CALL_ROW_BREATH_CLASS = "call-breath";
export const CALL_ROW_BREATH_MS = 1_600;
/** Only a troubled end takes a colour, and it is the words that take it; the mark stays as it is. */
export const CALL_ROW_SAID_NO_COLOR = BROKEN_COLOR;

export const CALL_ROW_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const CALL_ROW_NAME_FONT_SIZE_PX = 10.5;
export const CALL_ROW_STATE_COLOR = "#5c6478";
export const CALL_ROW_STATE_LETTER_SPACING_PX = 1;

/** The right cell names the end — the code when there is one, words when a call never started. */
export const CALL_ROW_RUNNING_LABEL = "БІЖИТЬ";
export const CALL_ROW_REFUSED_LABEL = "НЕ ЗАПУСТИЛАСЬ · КОДУ НЕМА";
export const CALL_ROW_CODE_LABEL = "КОД ";
export const CALL_ROW_SEPARATOR = " · ";

/**
 * A call to a server has no exit code — the server was asked, no program was run — so on the code's place
 * stands the one number a server has: how long it took to answer. «Порожніх полів не тримаємо».
 */
export const CALL_ROW_ANSWERED_LABEL = "ВІДПОВІВ ЗА ";
/** The server was asked and said «ні» — the function is there, so this is neither a break nor a refusal. */
export const CALL_ROW_SAID_NO_LABEL = "СЕРВЕР ВІДМОВИВ";
export const CALL_ROW_SECONDS_LABEL = " С";
export const CALL_ROW_SECONDS_DIGITS = 2;
/** Where the call went, said in the opened block above the arguments. */
export const CALL_ROW_SOURCE_LABEL = "ДЖЕРЕЛО";
/**
 * The server's answer is a block of its own in the card, named, and beside the name stands the one thing
 * offered about it: taking it away whole. A command's output keeps no such head.
 */
export const CALL_ROW_SAID_LABEL = "ВІДПОВІДЬ СЕРВЕРА";
export const CALL_ROW_SAID_GAP_PX = 9;
export const CALL_ROW_SOURCE_KIND = "сервер";

export const CALL_ROW_BODY_BACKGROUND_COLOR = "#0d0f16";
export const CALL_ROW_BODY_BORDER_RADIUS_PX = 6;
export const CALL_ROW_BODY_PADDING = "7px 8px";
export const CALL_ROW_BODY_FONT_SIZE_PX = 9.5;
export const CALL_ROW_BODY_LINE_HEIGHT = 1.7;
export const CALL_ROW_BODY_COLOR = CONTROL_AT_REST_COLOR;
export const CALL_ROW_BODY_QUIET_COLOR = "#4a5164";
export const CALL_ROW_BODY_PINNED_COLOR = "#38a3ff";
/** A long output scrolls inside its own block; the chat itself never scrolls sideways. */
export const CALL_ROW_BODY_MAX_HEIGHT_PX = 220;

export const CALL_ROW_FROM_MODEL_LABEL = "ВІД МОДЕЛІ";
export const CALL_ROW_PINNED_LABEL = "ЗАКРІПЛЕНО";
export const CALL_ROW_NO_OUTPUT_YET_LABEL = "вивід ще не прийшов";
export const CALL_ROW_ARGUMENT_SEPARATOR = " · ";
export const CALL_ROW_LINE_PREFIX = "$ ";

export const CALL_ROW_CHEVRON_SIZE_PX = 10;
export const CALL_ROW_CHEVRON_COLOR = "#4a5164";
export const CALL_ROW_CHEVRON_OPEN_COLOR = "#5c6478";
