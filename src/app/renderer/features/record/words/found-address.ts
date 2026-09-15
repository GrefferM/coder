import { FOUND_STEP_PREFIX, RUN_HISTORY_SEPARATOR } from "../constants";

/**
 * The address of one found message, said the way its own card says it — «КРОК 2 · 14:12».
 * The person's own question stands on no step of the walk, so it wears the hour alone; every message has an hour,
 * and it is by that hour the list is ordered.
 */
export function foundAddress(step: number | null, at: string): string {
  return step === null ? at : `${FOUND_STEP_PREFIX}${step}${RUN_HISTORY_SEPARATOR}${at}`;
}
