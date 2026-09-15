import { RUN_STEPS_FEW, RUN_STEPS_MANY, RUN_STEPS_ONE } from "../constants";

/** «2 КРОКИ», «5 КРОКІВ» — how many steps a run took, said in Ukrainian. */
export function stepsLabel(steps: number): string {
  const last = steps % 10;
  const tens = steps % 100;

  if (last === 1 && tens !== 11) {
    return `${steps}${RUN_STEPS_ONE}`;
  }

  return last >= 2 && last <= 4 && (tens < 12 || tens > 14) ? `${steps}${RUN_STEPS_FEW}` : `${steps}${RUN_STEPS_MANY}`;
}
