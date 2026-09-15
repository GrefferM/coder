import { levelsOf } from "../../../../../contracts";
import type { WholeStep } from "../../record";

/**
 * Which step of the walk each turn of a run read back stands on. The rule is `levelsOf`'s; what belongs here is
 * that a step is named by its own id and fed by the steps the record kept beside it.
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
