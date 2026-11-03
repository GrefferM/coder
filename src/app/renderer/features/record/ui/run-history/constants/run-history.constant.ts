import {
  BORDER_AT_REST_COLOR,
  FALLEN_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  HAIRLINE_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../constants";
import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_RUNNING, RUN_STOPPED } from "../../../constants";
import type { RunStateDot } from "../interfaces";

/** The list of runs — one row per flow, however many questions it was asked. */
export const RUN_HISTORY_PADDING = "16px";
export const RUN_HISTORY_GAP_PX = 10;
export const RUN_HISTORY_EMPTY_NOTE = "Історія порожня";
export const RUN_HISTORY_EMPTY_COLOR = SECOND_LEVEL_TEXT_COLOR;
/** The closing rule under the list. */
export const RUN_HISTORY_NOTE_COLOR = QUIET_MARK_COLOR;
export const RUN_HISTORY_EMPTY_PADDING = "22px 16px";
export const RUN_HISTORY_EMPTY_FONT_SIZE_PX = 12.5;

/** At rest, and one step closer to the foreground on hover or focus. */
export const RUN_HISTORY_ROW_BACKGROUND_COLOR = INTERACTION_REST_BACKGROUND_COLOR;
export const RUN_HISTORY_ROW_LIT_BACKGROUND_COLOR = INTERACTION_HOVER_BACKGROUND_COLOR;
export const RUN_HISTORY_ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const RUN_HISTORY_ROW_LIT_BORDER_COLOR = INTERACTION_HOVER_BORDER_COLOR;
export const RUN_HISTORY_ROW_BORDER_RADIUS_PX = 10;
export const RUN_HISTORY_ROW_PADDING = "11px";
export const RUN_HISTORY_ROW_GAP_PX = 7;
export const RUN_HISTORY_HEAD_GAP_PX = 8;

export const RUN_HISTORY_ASKED_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const RUN_HISTORY_ASKED_FONT_SIZE_PX = 12.5;
export const RUN_HISTORY_ASKED_LINE_HEIGHT = 1.5;
/** The question shows two lines; the rest is under the press. */
export const RUN_HISTORY_ASKED_LINES = 2;
export const RUN_HISTORY_OPEN_HINT = "Показати запуск у потоці";
/** Deleting a row is irreversible; the glyph is always shown, its box arrives with the row. */
export const RUN_HISTORY_FORGET_LABEL = "Видалити запуск";
export const RUN_HISTORY_FORGET_COLOR = QUIET_MARK_COLOR;
export const RUN_HISTORY_FORGET_RAISED_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const RUN_HISTORY_FORGET_LIT_COLOR = "#ff6b8a";
export const RUN_HISTORY_FORGET_BACKGROUND_COLOR = "#22212c";
export const RUN_HISTORY_FORGET_BORDER_RADIUS_PX = 5;
export const RUN_HISTORY_FORGET_SIZE_PX = 18;
export const RUN_HISTORY_FORGET_ICON_SIZE_PX = 11;
export const RUN_HISTORY_FORGET_ICON_STROKE = "2.4";
/** Inset by the row's own padding, as it stands on the head line. */
export const RUN_HISTORY_FORGET_INSET_PX = 11;
export const RUN_HISTORY_QUIET_COLOR = "#5c6478";
/** The hour's text level while the row is raised. */
export const RUN_HISTORY_QUIET_LIT_COLOR = "#aab3cc";
/** An agent the project no longer holds is named quiet, with no colour. */
export const RUN_HISTORY_GONE_NAME_COLOR = "#6b7490";
export const RUN_HISTORY_QUIET_FONT_SIZE_PX = 9;
export const RUN_HISTORY_QUIET_LETTER_SPACING_PX = 1;

export const RUN_HISTORY_RUNNING_COLOR = "#4ade80";
export const RUN_HISTORY_FAILED_COLOR = FALLEN_COLOR;

/** The state is a dot in its own colour plus a quiet word, with no pill. */
export const RUN_HISTORY_STATE_DOT_SIZE_PX = 6;
/** Nothing was sent: an empty outline, not a colour. */
export const RUN_HISTORY_EMPTY_DOT_BORDER = `1px solid ${RUN_HISTORY_QUIET_COLOR}`;
export const RUN_HISTORY_EMPTY_DOT_COLOR = "transparent";
/** A running run glows: the dot breathes, the row border turns green, the hour brightens. */
export const RUN_HISTORY_RUNNING_DOT_GLOW_PX = 8;
export const RUN_HISTORY_RUNNING_BORDER_COLOR = "#2c4a3a";

/** The one search over the whole record. */
export const RUN_SEARCH_PLACEHOLDER = "Пошук по запиту, текстах і викликах";
export const RUN_SEARCH_LABEL = "Пошук по запису";
export const RUN_SEARCH_BACKGROUND_COLOR = "#171b26";
export const RUN_SEARCH_BORDER_COLOR = "#262b3a";
export const RUN_SEARCH_LIT_BORDER_COLOR = "#2c3550";
export const RUN_SEARCH_BORDER_RADIUS_PX = 9;
export const RUN_SEARCH_PADDING = "8px 10px";
export const RUN_SEARCH_GAP_PX = 8;
export const RUN_SEARCH_ICON_SIZE_PX = 13;
export const RUN_SEARCH_ICON_STROKE = "2";
export const RUN_SEARCH_ICON_COLOR = "#5c6478";
export const RUN_SEARCH_FONT_SIZE_PX = 12;
export const RUN_SEARCH_COLOR = "#dde1ee";
export const RUN_SEARCH_COUNT_COLOR = "#6b7490";
/** A call's words are mono, marking where the snippet came from. */
export const RUN_SEARCH_CALL_FONT = "'IBM Plex Mono', monospace";
/** The clear cross shows only while there is a word. */
export const RUN_SEARCH_CLEAR_LABEL = "Прибрати слово";
export const RUN_SEARCH_CLEAR_PATH = "M6 6l12 12M18 6L6 18";
export const RUN_SEARCH_CLEAR_SIZE_PX = 20;
export const RUN_SEARCH_CLEAR_RADIUS_PX = 5;
export const RUN_SEARCH_CLEAR_ICON_SIZE_PX = 11;
export const RUN_SEARCH_CLEAR_ICON_STROKE = "2.2";
export const RUN_SEARCH_CLEAR_COLOR = "#5c6478";
export const RUN_SEARCH_CLEAR_LIT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const RUN_SEARCH_CLEAR_LIT_BACKGROUND_COLOR = "#1b1f2c";
export const RUN_SEARCH_NOTHING_PADDING = "18px 0 22px";
export const RUN_SEARCH_NOTHING_LINE_HEIGHT = 1.6;

export const RUN_HISTORY_RULE_COLOR = HAIRLINE_COLOR;

/** A flow with no known sum (`money` null): it has no steps, or none ran with prices written. */
export const RUN_HISTORY_NO_MONEY_LABEL = "БЕЗ ГРОШЕЙ";

/** Under a flow older than its group: the day it began, said quietly. */
export const RUN_HISTORY_STARTED_PREFIX = "ПОЧАТО ";

/** The one rule at the end of the list: how long the record lives. */
export const RUN_HISTORY_SWEEP_NOTE = "ІСТОРІЯ ЖИВЕ 30 ДНІВ І ЧИСТИТЬСЯ АВТОМАТИЧНО";
export const RUN_HISTORY_FOOT_GAP_PX = 9;
export const RUN_HISTORY_FOOT_PADDING = "12px 2px 2px";
export const RUN_HISTORY_FOOT_TOP_PX = 4;
export const RUN_HISTORY_FOOT_LINE_HEIGHT = 1.7;

/** The rule naming a run where the flat list changes runs: its day, hour and the start of its question. */
export const FOUND_RULE_PADDING = "7px 2px 0";
export const FOUND_RULE_GAP_PX = 7;
/** Day and hour are dimmer than the question. */
export const FOUND_RULE_WHEN_COLOR = "#4a5164";
export const FOUND_RULE_WHEN_FONT_SIZE_PX = 9;
export const FOUND_RULE_WHEN_LETTER_SPACING_PX = 1.5;
export const FOUND_RULE_ASKED_COLOR = "#6b7490";
export const FOUND_RULE_ASKED_FONT_SIZE_PX = 11;
export const FOUND_RULE_ASKED_LINE_HEIGHT = 1.4;

/** The dot each state wears in a row's head. */
export const RUN_HISTORY_STATE_DOTS: Record<string, RunStateDot> = {
  [RUN_RUNNING]: {
    color: RUN_HISTORY_RUNNING_COLOR,
    border: undefined,
  },
  [RUN_DONE]: {
    color: RUN_HISTORY_QUIET_COLOR,
    border: undefined,
  },
  [RUN_FAILED]: {
    color: RUN_HISTORY_FAILED_COLOR,
    border: undefined,
  },
  [RUN_STOPPED]: {
    color: RUN_HISTORY_QUIET_COLOR,
    border: undefined,
  },
  [RUN_NOT_SENT]: {
    color: RUN_HISTORY_EMPTY_DOT_COLOR,
    border: RUN_HISTORY_EMPTY_DOT_BORDER,
  },
};
