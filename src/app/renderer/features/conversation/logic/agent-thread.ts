import { RUN_STEP_DONE } from "../../record";
import type { Agent, ChatTurn } from "../../../interfaces";
import type { WholeStep } from "../../record";

/**
 * What an agent has been through in this conversation, in order: each input and its answer; who asked is not recorded.
 * Only a step that answered makes a pair; an agent that does not keep its thread has none.
 */
export function agentThread(steps: WholeStep[], agent: Agent): ChatTurn[] {
  if (!agent.keepsThread) {
    return [];
  }

  return [...steps]
    .sort((one, other) => one.place - other.place)
    .filter((step) => step.agentId === agent.id && step.state === RUN_STEP_DONE)
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
