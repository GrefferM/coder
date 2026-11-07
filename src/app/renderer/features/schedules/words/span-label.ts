import { MINUTES_IN_HOUR, SCHEDULE_HOURS_WORD, SCHEDULE_MINUTES_WORD } from "../constants";

/** Whole minutes in the row's words: «45 ХВ», «2 ГОД», «1 ГОД 30 ХВ». */
export function spanLabel(minutes: number): string {
  if (minutes < MINUTES_IN_HOUR) {
    return `${minutes} ${SCHEDULE_MINUTES_WORD}`;
  }

  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const rest = minutes % MINUTES_IN_HOUR;

  if (rest === 0) {
    return `${hours} ${SCHEDULE_HOURS_WORD}`;
  }

  return `${hours} ${SCHEDULE_HOURS_WORD} ${rest} ${SCHEDULE_MINUTES_WORD}`;
}
