import { RUN_STEP_DONE } from "../../record";
import type { ChatTurn } from "../../../interfaces";
import type { WholeStep } from "../../record";

/**
 * What an agent has been through in this conversation, in the order it went through it: what arrived, and
 * what it answered. Who asked is not in it — a person and a neighbour are the same thing to an agent, which
 * is an input and an answer and nothing else.
 *
 * Only a step that answered makes a pair. A turn that was cut, fell, was stopped or never began leaves
 * nothing at all — neither its input nor its fragment — because «Спитати ще раз» makes the step that will,
 * and an input with no answer under it would leave two of the person's turns standing in a row.
 */
export function agentThread(steps: WholeStep[], agentId: string): ChatTurn[] {
  return [...steps]
    .sort((one, other) => one.place - other.place)
    .filter((step) => step.agentId === agentId && step.state === RUN_STEP_DONE)
    .flatMap((step) => [
      {
        from: "person" as const,
        text: step.asked,
      },
      {
        from: "agent" as const,
        text: step.said,
      },
    ]);
}
