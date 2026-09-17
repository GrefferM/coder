import { ukrainianPlural } from "../text";
import {
  FRESH_AGO_LABEL,
  FRESH_DATE_AFTER_DAYS,
  FRESH_DAY_FORMS,
  FRESH_HOURS_UNIT,
  FRESH_JUST_NOW_LABEL,
  FRESH_MINUTES_UNIT,
  FRESH_MONTH_SUFFIX,
  FRESH_YESTERDAY_LABEL,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  MONTH_ABBREVIATIONS,
  MS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from "./constants";

/**
 * How fresh something is, on the one scale the whole app speaks — the server's row and its «оновлено»,
 * and the recent folders.
 *
 * Six steps and nothing between them, **the boundary belonging to the lower one and the rounding always down**:
 * «1 хв» comes on the sixtieth second and not on the thirtieth, because rounding up is promising what has not
 * happened yet. There are no seconds anywhere on this scale — seconds belong to the clock of what is running now
 * — and no weeks or months: from the seventh day the row says the date, which is a fact and not a step.
 */
export function freshLabel(at: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - at) / MS_IN_SECOND));

  if (seconds < SECONDS_IN_MINUTE) {
    return FRESH_JUST_NOW_LABEL;
  }

  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);

  if (minutes < MINUTES_IN_HOUR) {
    return `${minutes} ${FRESH_MINUTES_UNIT} ${FRESH_AGO_LABEL}`;
  }

  const hours = Math.floor(minutes / MINUTES_IN_HOUR);

  if (hours < HOURS_IN_DAY) {
    return `${hours} ${FRESH_HOURS_UNIT} ${FRESH_AGO_LABEL}`;
  }

  // «вчора» is a count of hours and not a turn of the calendar — 24 to 47 of them, and no exception.
  if (hours < HOURS_IN_DAY * 2) {
    return FRESH_YESTERDAY_LABEL;
  }

  const days = Math.floor(hours / HOURS_IN_DAY);
  const [one, few, many] = FRESH_DAY_FORMS;

  return days < FRESH_DATE_AFTER_DAYS
    ? `${days} ${ukrainianPlural(days, one, few, many)} ${FRESH_AGO_LABEL}`
    : dayAndMonth(new Date(at), new Date(now));
}

/** «12 бер.», and «12 бер. 2025» in another year — the year is written only where it says something. */
function dayAndMonth(then: Date, now: Date): string {
  const month = `${MONTH_ABBREVIATIONS[then.getMonth()].toLowerCase()}${FRESH_MONTH_SUFFIX}`;
  const said = `${then.getDate()} ${month}`;

  return then.getFullYear() === now.getFullYear() ? said : `${said} ${then.getFullYear()}`;
}
