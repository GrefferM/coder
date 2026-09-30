import type { RunRow } from "../../../../../interfaces";

export interface FoundRuleProps {
  /** The run the rows under the rule belong to. */
  run: RunRow;
  /** Today, so «СЬОГОДНІ» can be a word rather than a date. */
  now: Date;
}
