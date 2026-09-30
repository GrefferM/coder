import { stepMoneyWord } from "./step-money-word";
import { stepBegan } from "../../record";
import { spanLabel } from "../../../utils/dates";
import { groupedNumber } from "../../../utils/numbers";
import { TOKENS_SUFFIX } from "../../../utils/numbers/constants";
import { STEP_NOT_STARTED_SPAN, STEP_NOT_STARTED_TOKENS, STEP_SEPARATOR } from "../constants";
import type { WholeStep } from "../../record";

/**
 * «qwen2.5-coder · 48 c · 6 120 ТКН · ЛОКАЛЬНО»: what the turn ran on, what it took and its cost. A turn that never
 * went out shows a dash for time and true noughts for tokens and money.
 */
export function stepCardLabel(step: WholeStep): string {
  const began = stepBegan(step.state);

  return [
    step.model,
    began ? spanLabel(step.endedAt.getTime() - step.startedAt.getTime()) : STEP_NOT_STARTED_SPAN,
    `${groupedNumber(began ? step.inputTokens + step.outputTokens : STEP_NOT_STARTED_TOKENS)}${TOKENS_SUFFIX}`,
    stepMoneyWord(step),
  ].join(STEP_SEPARATOR);
}
