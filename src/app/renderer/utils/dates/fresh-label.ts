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
 * How fresh something is, on the app's one scale (server page, recent folders). Six steps, each rounded down («1 хв»
 * from sixty seconds on); from the seventh day it gives the date.
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

  // «вчора» covers 24 to 47 hours, not a calendar day.
  if (hours < HOURS_IN_DAY * 2) {
    return FRESH_YESTERDAY_LABEL;
  }

  const days = Math.floor(hours / HOURS_IN_DAY);
  const [one, few, many] = FRESH_DAY_FORMS;

  return days < FRESH_DATE_AFTER_DAYS
    ? `${days} ${ukrainianPlural(days, one, few, many)} ${FRESH_AGO_LABEL}`
    : dayAndMonth(new Date(at), new Date(now));
}

/** «12 бер.», with the year («12 бер. 2025») only in another year. */
function dayAndMonth(then: Date, now: Date): string {
  const month = `${MONTH_ABBREVIATIONS[then.getMonth()].toLowerCase()}${FRESH_MONTH_SUFFIX}`;
  const said = `${then.getDate()} ${month}`;

  return then.getFullYear() === now.getFullYear() ? said : `${said} ${then.getFullYear()}`;
}
