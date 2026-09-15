import {
  MS_IN_SECOND,
  SECONDS_IN_MINUTE,
  SPAN_MINUTES_LABEL,
  SPAN_SECONDS_LABEL,
  SPAN_UNDER_SECOND_LABEL,
} from "./constants";

/** How long something took — «44 c», «2 хв 18», «12 хв» with no seconds, «< 1 c» under one; rounded down. */
export function spanLabel(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / MS_IN_SECOND));

  if (seconds === 0) {
    return SPAN_UNDER_SECOND_LABEL;
  }

  if (seconds < SECONDS_IN_MINUTE) {
    return `${seconds}${SPAN_SECONDS_LABEL}`;
  }

  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const left = seconds % SECONDS_IN_MINUTE;

  return left === 0 ? `${minutes}${SPAN_MINUTES_LABEL}` : `${minutes}${SPAN_MINUTES_LABEL} ${left}`;
}
