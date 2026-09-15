import { stepBegan } from "../../record";
import { STEP_MONEY_NO_PRICES_LABEL, STEP_NOT_STARTED_LABEL } from "../constants";
import type { WholeStep } from "../../record";

/**
 * One line under the head, standing once per step and speaking for it — nothing where every number of that
 * step is a number it really carried. A turn that never went out says so first: it explains the whole head, prices
 * included, and «ЦІНИ НЕ ВПИСАНО» over it would name a cause that never got to matter.
 */
export function stepUnknownWord(step: WholeStep): string | null {
  if (!stepBegan(step.state)) {
    return STEP_NOT_STARTED_LABEL;
  }

  return step.inputPrice === null || step.outputPrice === null ? STEP_MONEY_NO_PRICES_LABEL : null;
}
