import { stepBegan } from "../../record";
import { STEP_MONEY_NO_PRICES_LABEL, STEP_NOT_STARTED_LABEL } from "../constants";
import type { WholeStep } from "../../record";

/**
 * One line per step explaining its dashes; null where every number is real. A turn that never went out says so first,
 * since that explains the whole head, prices included.
 */
export function stepUnknownWord(step: WholeStep): string | null {
  if (!stepBegan(step.state)) {
    return STEP_NOT_STARTED_LABEL;
  }

  return step.inputPrice === null || step.outputPrice === null ? STEP_MONEY_NO_PRICES_LABEL : null;
}
