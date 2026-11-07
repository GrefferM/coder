import type { ScheduleRowState } from "../interfaces";

/** The fields a row names when one is not written, in the form's order. */
export const SCHEDULE_FIELD_AGENT = "АГЕНТ";
export const SCHEDULE_FIELD_TASK = "ЗАВДАННЯ";
export const SCHEDULE_FIELD_INTERVAL = "ІНТЕРВАЛ";

/** The row's state word. */
export const SCHEDULE_UNFILLED_WORD = "НЕ ЗАПОВНЕНО";
export const SCHEDULE_STATE_WORDS: Record<ScheduleRowState, string> = {
  out: "ІДЕ",
  on: "УВІМКНЕНО",
  off: "ВИМКНЕНО",
  unfilled: SCHEDULE_UNFILLED_WORD,
  agentGone: "НЕМА АГЕНТА",
};

/** How often and how soon, in the row's lower line. */
export const SCHEDULE_EVERY_WORD = "КОЖНІ";
export const SCHEDULE_NEXT_WORD = "НАСТУПНИЙ ЧЕРЕЗ";
export const SCHEDULE_MINUTES_WORD = "ХВ";
export const SCHEDULE_HOURS_WORD = "ГОД";
export const SCHEDULE_UNDER_MINUTE_LABEL = "< 1 ХВ";
export const MINUTES_IN_HOUR = 60;
export const MINUTE_MS = 60_000;

/** How often the countdowns are read again. */
export const SCHEDULE_BEAT_MS = 15_000;
