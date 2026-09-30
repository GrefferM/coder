import { RUN_STEP_DONE } from "../../record";
import type { ChatTurn } from "../../../interfaces";
import type { WholeStep } from "../../record";

/**
 * What an agent has been through in this conversation, in order: each input and its answer; who asked is not recorded.
 * Only a step that answered makes a pair.
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
