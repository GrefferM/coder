import { RUN_STEP_RAN_ENDS } from "../constants";

/**
 * Whether this step's turn ever went out. A step is written for every attempt, and some of them
 * never left the app — no key, no model, a field nobody filled, words over the ceiling. Such a step is a record of a
 * refusal, not of a turn, and nothing was spent on it.
 */
export function stepBegan(state: string): boolean {
  return RUN_STEP_RAN_ENDS.includes(state);
}
