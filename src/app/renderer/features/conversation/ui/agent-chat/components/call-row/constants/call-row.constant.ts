import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
} from "../../../../../../../constants";

/** One call folded into a line. */
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
/** A running call's mark takes the agent's colour and breathes. */
export const CALL_ROW_BREATH_CLASS = "call-breath";
export const CALL_ROW_BREATH_MS = 1_600;
/** Only a troubled end takes a colour, and only on the words. */
export const CALL_ROW_SAID_NO_COLOR = BROKEN_COLOR;

export const CALL_ROW_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const CALL_ROW_NAME_FONT_SIZE_PX = 10.5;
export const CALL_ROW_STATE_COLOR = "#5c6478";
export const CALL_ROW_STATE_LETTER_SPACING_PX = 1;

/** Right cell: the exit code, or words when the call never started. */
export const CALL_ROW_RUNNING_LABEL = "БІЖИТЬ";
export const CALL_ROW_REFUSED_LABEL = "НЕ ЗАПУСТИЛАСЬ · КОДУ НЕМА";
export const CALL_ROW_CODE_LABEL = "КОД ";
export const CALL_ROW_SEPARATOR = " · ";

/** A server call has no exit code; this label introduces its answer time instead. */
export const CALL_ROW_ANSWERED_LABEL = "ВІДПОВІВ ЗА ";
/** The server answered «ні»: neither a break nor a refusal. */
export const CALL_ROW_SAID_NO_LABEL = "СЕРВЕР ВІДМОВИВ";
/** The agent could not run to an answer: neither a break nor a refusal. */
export const CALL_ROW_AGENT_FAILED_LABEL = "АГЕНТ НЕ ВІДПОВІВ";
export const CALL_ROW_SECONDS_LABEL = " С";
export const CALL_ROW_SECONDS_DIGITS = 2;
/** Where the call went, shown above the arguments in the opened block. */
export const CALL_ROW_SOURCE_LABEL = "ДЖЕРЕЛО";
/** Head of the server's answer block, with «СКОПІЮВАТИ» beside it; a command's output has no head. */
export const CALL_ROW_SAID_LABEL = "ВІДПОВІДЬ СЕРВЕРА";
/** Head of the agent's answer block, with «СКОПІЮВАТИ» beside it. */
export const CALL_ROW_AGENT_SAID_LABEL = "ВІДПОВІДЬ АГЕНТА";
export const CALL_ROW_SAID_GAP_PX = 9;
export const CALL_ROW_SOURCE_KIND = "сервер";
/** Stands where a server's name would on the source line of an agent call. */
export const CALL_ROW_AGENT_KIND = "агент";

/** A route call (`pass_to`, `finish_here`) runs nothing: it is the agent's decision about where its answer goes. */
export const CALL_ROW_ROUTE_LABEL = "МАРШРУТ";
export const CALL_ROW_ROUTE_REFUSED_LABEL = "МАРШРУТ НЕ ПРИЙНЯТО";
export const CALL_ROW_ROUTE_KIND = "маршрут";

export const CALL_ROW_BODY_BACKGROUND_COLOR = "#0d0f16";
export const CALL_ROW_BODY_BORDER_RADIUS_PX = 6;
export const CALL_ROW_BODY_PADDING = "7px 8px";
export const CALL_ROW_BODY_FONT_SIZE_PX = 9.5;
export const CALL_ROW_BODY_LINE_HEIGHT = 1.7;
export const CALL_ROW_BODY_COLOR = CONTROL_AT_REST_COLOR;
export const CALL_ROW_BODY_QUIET_COLOR = "#4a5164";
export const CALL_ROW_BODY_PINNED_COLOR = "#38a3ff";
/** A long output scrolls inside its block; the chat never scrolls sideways. */
export const CALL_ROW_BODY_MAX_HEIGHT_PX = 220;

export const CALL_ROW_FROM_MODEL_LABEL = "ВІД МОДЕЛІ";
export const CALL_ROW_PINNED_LABEL = "ЗАКРІПЛЕНО";
export const CALL_ROW_NO_OUTPUT_YET_LABEL = "вивід ще не прийшов";
export const CALL_ROW_ARGUMENT_SEPARATOR = " · ";
export const CALL_ROW_LINE_PREFIX = "$ ";

export const CALL_ROW_CHEVRON_SIZE_PX = 10;
export const CALL_ROW_CHEVRON_COLOR = "#4a5164";
export const CALL_ROW_CHEVRON_OPEN_COLOR = "#5c6478";
