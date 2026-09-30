import { FOUND_STEP_PREFIX, RUN_HISTORY_SEPARATOR } from "../constants";

/**
 * The address of one found message, as its card says it: «КРОК 2 · 14:12». The person's own question has no step, so it
 * carries the hour alone.
 */
export function foundAddress(step: number | null, at: string): string {
  return step === null ? at : `${FOUND_STEP_PREFIX}${step}${RUN_HISTORY_SEPARATOR}${at}`;
}
