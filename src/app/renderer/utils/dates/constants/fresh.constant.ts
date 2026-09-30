/** The app's one freshness scale: six steps, answering «how fresh», not «when exactly». */
export const FRESH_JUST_NOW_LABEL = "щойно";
export const FRESH_YESTERDAY_LABEL = "вчора";
export const FRESH_MINUTES_UNIT = "хв";
export const FRESH_HOURS_UNIT = "год";
export const FRESH_AGO_LABEL = "тому";
/** «2 дні тому», «6 днів тому»: forms of «день» agreeing with the number. */
export const FRESH_DAY_FORMS: [string, string, string] = ["день", "дні", "днів"];
/** From this day on the row shows the date instead of a step. */
export const FRESH_DATE_AFTER_DAYS = 7;
export const FRESH_MONTH_SUFFIX = ".";
/**
 * A line is re-read at its step's beat (minutes every minute, hours and days every hour) and never once it is a date.
 */
export const FRESH_MINUTE_BEAT_MS = 60_000;
export const FRESH_HOUR_BEAT_MS = 3_600_000;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
