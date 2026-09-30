import { MS_IN_SECOND, SECONDS_IN_MINUTE, TIME_PART_LENGTH } from "./constants";

/** How far into a run a step began: «0:00», «0:12», «1:16». A ruler reading, not a length (`spanLabel`). */
export function offsetLabel(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / MS_IN_SECOND));
  const left = String(seconds % SECONDS_IN_MINUTE).padStart(TIME_PART_LENGTH, "0");

  return `${Math.floor(seconds / SECONDS_IN_MINUTE)}:${left}`;
}
