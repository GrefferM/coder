import { moneyLabel } from "../../../utils/numbers";
import { stepBegan } from "../../record";
import { STEP_MONEY_FREE_LABEL, STEP_NOT_STARTED_MONEY } from "../constants";
import type { WholeStep } from "../../record";

/**
 * The money on a step's head. A turn that never went out is a known nought; an unwritten price leaves the dash
 * `moneyLabel` stands for; a price written as nothing is «ЛОКАЛЬНО».
 */
export function stepMoneyWord(step: WholeStep): string {
  if (!stepBegan(step.state)) {
    return moneyLabel(STEP_NOT_STARTED_MONEY);
  }

  if (step.inputPrice === 0 && step.outputPrice === 0) {
    return STEP_MONEY_FREE_LABEL;
  }

  return moneyLabel(step.money);
}
