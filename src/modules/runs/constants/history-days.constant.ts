/** A run lives thirty days on this machine, then goes without being asked. */
export const HISTORY_DAYS = 30;

/** How long that is in milliseconds, so the sweep can compare two dates and nothing else. */
export const HISTORY_DAY_MS = 24 * 60 * 60 * 1000;
