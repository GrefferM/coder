import { RUN_STEP_RAN_ENDS } from "../constants";

/**
 * Whether the step's turn ever went out. A step is written for every attempt; some never left the app (no key, no
 * model, an unfilled field, words over the ceiling), record a refusal and cost nothing.
 */
export function stepBegan(state: string): boolean {
  return RUN_STEP_RAN_ENDS.includes(state);
}
