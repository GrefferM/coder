import {
  FRESH_DATE_AFTER_DAYS,
  FRESH_HOUR_BEAT_MS,
  FRESH_MINUTE_BEAT_MS,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  MS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from "./constants";

/**
 * Milliseconds until a freshness line is worth re-reading: a minute while counting minutes, an hour while counting
 * hours or days, `null` once it shows a date.
 */
export function freshTick(at: number, now: number): number | null {
  const minutes = Math.max(0, Math.floor((now - at) / MS_IN_SECOND / SECONDS_IN_MINUTE));

  if (minutes < MINUTES_IN_HOUR) {
    return FRESH_MINUTE_BEAT_MS;
  }

  return minutes < MINUTES_IN_HOUR * HOURS_IN_DAY * FRESH_DATE_AFTER_DAYS ? FRESH_HOUR_BEAT_MS : null;
}
