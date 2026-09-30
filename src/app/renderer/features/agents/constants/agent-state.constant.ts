import { CONTROL_AT_REST_COLOR, FALLEN_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../constants";

/** State line: dot, word, at most one moment; green live, grey rest, pink stop. */
export const STATE_READY_LABEL = "готовий";
export const STATE_WORKING_LABEL = "працює";
export const STATE_WAITING_LABEL = "чекає постачальника";
export const STATE_OFF_LABEL = "вимкнено";
export const STATE_FELL_LABEL = "упав";
export const STATE_PROVIDER_SILENT_LABEL = "не відповідає";
export const STATE_MODEL_MISSING_LABEL = "моделі нема на машині";
export const STATE_WONT_START_LABEL = "не запуститься";

export const STATE_LIVE_COLOR = "#4ade80";
export const STATE_WAITING_COLOR = CONTROL_AT_REST_COLOR;
export const STATE_OFF_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const STATE_STOP_COLOR = FALLEN_COLOR;
export const STATE_SEPARATOR = " · ";
