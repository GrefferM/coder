import { RUN_STEP_DONE } from "../../../contracts";
import type { Agent, ChatTurn, WholeStep } from "../../../contracts";

/**
 * What an agent has been through in this conversation, in order: each input and its answer; who asked is not recorded.
 * Only a step that answered makes a pair; an agent whose memory is not its own has none.
 */
export function agentThread(steps: WholeStep[], agent: Agent): ChatTurn[] {
  if (agent.memory !== "own") {
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
