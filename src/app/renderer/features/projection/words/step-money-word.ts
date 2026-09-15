import { moneyLabel } from "../../../utils/numbers";
import { stepBegan } from "../../record";
import { STEP_MONEY_FREE_LABEL, STEP_NOT_STARTED_MONEY } from "../constants";
import type { WholeStep } from "../../record";

/**
 * The money on a step's head. A turn that never went out spent nothing, and that nought is known whatever
 * the prices were — the dash would say the sum is unknown, which is the one thing it is not. A price the person never
 * wrote leaves the dash `moneyLabel` already stands for; a price they wrote as nothing is «ЛОКАЛЬНО», which is a known
 * cost of nothing rather than an unknown one.
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
