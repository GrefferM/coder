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
 * How long until a line on the freshness scale is worth reading again — a minute while it counts in
 * minutes, an hour while it counts in hours or days, and **never** once it says a date.
 *
 * Nothing here beats every second: a second-by-second line would be a running clock, and a running clock belongs
 * to what is running now and not to how fresh something is.
 */
export function freshTick(at: number, now: number): number | null {
  const minutes = Math.max(0, Math.floor((now - at) / MS_IN_SECOND / SECONDS_IN_MINUTE));

  if (minutes < MINUTES_IN_HOUR) {
    return FRESH_MINUTE_BEAT_MS;
  }

  return minutes < MINUTES_IN_HOUR * HOURS_IN_DAY * FRESH_DATE_AFTER_DAYS ? FRESH_HOUR_BEAT_MS : null;
}
