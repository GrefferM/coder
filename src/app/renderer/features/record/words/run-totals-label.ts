import { stepsLabel } from "./steps-label";
import { RUN_HISTORY_SEPARATOR } from "../constants";
import { spanLabel } from "../../../utils/dates";
import { groupedNumber, moneyLabel } from "../../../utils/numbers";
import { TOKENS_SUFFIX } from "../../../utils/numbers/constants";
import type { WholeRun } from "../interfaces";

/** «3 хв 06 · 6 КРОКІВ · 18 240 ТКН · $0.21» — the whole run in one line: time, steps, tokens, money. */
export function runTotalsLabel(run: WholeRun): string {
  const tokens = run.walk.reduce((sum, step) => sum + step.inputTokens + step.outputTokens, 0);

  return [
    spanLabel(run.worked),
    stepsLabel(run.steps),
    `${groupedNumber(tokens)}${TOKENS_SUFFIX}`,
    moneyLabel(run.money),
  ].join(RUN_HISTORY_SEPARATOR);
}
