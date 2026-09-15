import { SECONDS_IN_MINUTE, TIME_PART_LENGTH } from "./constants";

/** Seconds under way, written as mm:ss — the one clock shape for anything that is running. */
export function elapsedClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / SECONDS_IN_MINUTE);
  const rest = whole % SECONDS_IN_MINUTE;

  return `${String(minutes).padStart(TIME_PART_LENGTH, "0")}:${String(rest).padStart(TIME_PART_LENGTH, "0")}`;
}
