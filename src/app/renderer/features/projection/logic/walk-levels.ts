import { levelsOf } from "../../../../../contracts";
import type { WholeStep } from "../../record";

/**
 * The level each step of a read-back run stands on, by step id and the steps it is fed by; the rule is `levelsOf`'s.
 */
export function walkLevels(walk: WholeStep[]): Record<string, number> {
  return levelsOf(
    walk.map((step) => ({
      id: step.id,
      at: step.id,
      fedBy: step.fromStepIds,
    })),
  );
}
