import { spanLabel } from "./span-label";
import { MINUTE_MS, SCHEDULE_NEXT_WORD, SCHEDULE_UNDER_MINUTE_LABEL } from "../constants";

/** «НАСТУПНИЙ ЧЕРЕЗ 12 ХВ», rounded down; under a minute, «< 1 ХВ». */
export function nextLabel(nextAt: number, now: number): string {
  const minutes = Math.floor((nextAt - now) / MINUTE_MS);

  if (minutes < 1) {
    return `${SCHEDULE_NEXT_WORD} ${SCHEDULE_UNDER_MINUTE_LABEL}`;
  }

  return `${SCHEDULE_NEXT_WORD} ${spanLabel(minutes)}`;
}
