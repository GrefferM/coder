import type { RunRow } from "../../../../../interfaces";

export interface FoundRuleProps {
  /** The run the rows under this rule belong to — its day, its hour and the start of its question. */
  run: RunRow;
  /** Today, so «СЬОГОДНІ» can be said as a word rather than as a date. */
  now: Date;
}
