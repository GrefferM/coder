import { SCHEDULE_STATE_WORDS, SCHEDULE_UNFILLED_WORD } from "../constants";
import type { ScheduleRowState, ScheduleTrouble } from "../interfaces";

/** The row's state word; an empty field is named after it: «НЕ ЗАПОВНЕНО · АГЕНТ». */
export function stateLabel(state: ScheduleRowState, trouble: ScheduleTrouble | null): string {
  if (trouble?.kind === "unfilled") {
    return `${SCHEDULE_UNFILLED_WORD} · ${trouble.field}`;
  }

  return SCHEDULE_STATE_WORDS[state];
}
