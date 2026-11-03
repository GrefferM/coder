import { RUN_FAILED, RUN_STATE_LABELS, RUN_STEP_PREFIX } from "../constants";

/** A run's state in one word; a fallen run may be told the step it fell on. */
export function runStateLabel(state: string, atStep: number | null = null): string {
  const word = RUN_STATE_LABELS[state] ?? "";

  return state === RUN_FAILED && atStep !== null ? `${word}${RUN_STEP_PREFIX}${atStep}` : word;
}
