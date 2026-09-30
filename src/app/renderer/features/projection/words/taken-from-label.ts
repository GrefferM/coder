import { TAKEN_FROM_LABEL, TAKEN_FROM_PREFIX, TAKEN_FROM_SEPARATOR, TAKEN_QUESTION_LABEL } from "../constants";
import type { WholeStep } from "../../record";

/**
 * «ОТРИМАВ ВІД EDITOR» over what came into the open step: the question itself where the person started it, each
 * supplier in pass order, or no one where the work came from outside this pass.
 */
export function takenFromLabel(step: WholeStep, walk: WholeStep[]): string {
  if (step.fromStepIds.length === 0) {
    return TAKEN_QUESTION_LABEL;
  }

  const names = walk
    .filter((other) => step.fromStepIds.includes(other.id))
    .sort((one, other) => one.place - other.place)
    .map((other) => other.agentName);

  return names.length === 0 ? TAKEN_FROM_LABEL : `${TAKEN_FROM_PREFIX}${names.join(TAKEN_FROM_SEPARATOR)}`;
}
