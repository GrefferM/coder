import { RUN_FAILED, RUN_STATE_LABELS, RUN_STEP_PREFIX } from "../constants";

/**
 * How a run stands, in one word. Every screen that says it says it in these words — the row in the history
 * and the pill over the projection alike — so one run never reads as two different things.
 *
 * A fallen run may also be told which step it fell on, which only a screen holding the whole walk can know;
 * without one the word stands alone.
 */
export function runStateLabel(state: string, atStep: number | null = null): string {
  const word = RUN_STATE_LABELS[state] ?? "";

  return state === RUN_FAILED && atStep !== null ? `${word}${RUN_STEP_PREFIX}${atStep}` : word;
}
