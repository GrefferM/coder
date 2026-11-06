import { CLOCK_SEPARATOR, PLAYED_SEPARATOR } from "../constants";

/** «0:07»: a recording's length in minutes and seconds. */
export function soundClock(ms: number): string {
  const seconds = Math.round(ms / 1_000);
  const minutes = Math.floor(seconds / 60);

  return `${minutes}${CLOCK_SEPARATOR}${String(seconds % 60).padStart(2, "0")}`;
}

/** «0:03 / 0:07» while it plays; its length alone while it stands. */
export function playedClock(playedMs: number | null, wholeMs: number): string {
  if (playedMs === null) {
    return soundClock(wholeMs);
  }

  return `${soundClock(Math.min(playedMs, wholeMs))}${PLAYED_SEPARATOR}${soundClock(wholeMs)}`;
}
