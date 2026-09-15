/**
 * The one scale of freshness in the app — six steps and **nothing between them**, because the question
 * it answers is «how fresh is this», not «when exactly». The hour belongs to the other language:
 * a row standing beside its neighbours in a record must be comparable, and a state must say whether it is still
 * true, which «14:12» does not until somebody subtracts it in their head.
 */
export const FRESH_JUST_NOW_LABEL = "щойно";
export const FRESH_YESTERDAY_LABEL = "вчора";
export const FRESH_MINUTES_UNIT = "хв";
export const FRESH_HOURS_UNIT = "год";
export const FRESH_AGO_LABEL = "тому";
/** «2 дні тому», «6 днів тому» — the verb-less form still has to agree with the number. */
export const FRESH_DAY_FORMS: [string, string, string] = ["день", "дні", "днів"];
/**
 * From the seventh day the row says the date and not a step. Weeks and months are a blurred measure
 * for what is no longer fresh — the day and the month are a fact, and a fact is worth more there than a step.
 */
export const FRESH_DATE_AFTER_DAYS = 7;
export const FRESH_MONTH_SUFFIX = ".";
/**
 * A line on this scale is re-read by the beat of its own step — minutes every minute, hours and days
 * every hour — and from the seventh day not at all, because a date does not go anywhere.
 */
export const FRESH_MINUTE_BEAT_MS = 60_000;
export const FRESH_HOUR_BEAT_MS = 3_600_000;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
