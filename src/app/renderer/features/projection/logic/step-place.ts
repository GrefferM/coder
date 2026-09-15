import type { StepPlace } from "../interfaces";
import type { WholeStep } from "../../record";

/**
 * Where the open step stands in its pass — «3 З 6» — and the steps the footer walks to. The order is the
 * one the pass ran in; a step that is not in this walk stands nowhere.
 */
export function stepPlace(walk: WholeStep[], stepId: string): StepPlace | null {
  const held = [...walk].sort((one, other) => one.place - other.place);
  const at = held.findIndex((step) => step.id === stepId);

  if (at < 0) {
    return null;
  }

  const neighbour = (index: number) => {
    const step = held[index];

    return step === undefined
      ? null
      : {
          id: step.id,
          number: index + 1,
          agentName: step.agentName,
        };
  };

  return {
    number: at + 1,
    count: held.length,
    before: neighbour(at - 1),
    after: neighbour(at + 1),
  };
}
