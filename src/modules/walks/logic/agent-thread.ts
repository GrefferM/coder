import { RUN_STEP_DONE } from "../../../contracts";
import type { Agent, ChatTurn, WholeMemory, WholeStep } from "../../../contracts";

/**
 * What an agent has been through in this conversation, in order: each input and its answer; who asked is not recorded.
 * Only a step that answered makes a pair; an agent whose memory is not its own has none. Where the thread was compressed,
 * only the pairs after the place the composer's message covers are here: it stands for the rest.
 */
export function agentThread(steps: WholeStep[], agent: Agent, composed: WholeMemory | null = null): ChatTurn[] {
  return answeredBy(steps, agent, composed).flatMap((step) => [
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

/** The last place of the record the thread stands for or tells: what a compression of it would cover; zero without any. */
export function threadCovers(steps: WholeStep[], agent: Agent, composed: WholeMemory | null = null): number {
  return Math.max(composed?.coversPlace ?? 0, ...answeredBy(steps, agent, composed).map((step) => step.place));
}

/** The agent's own steps that answered after what the compression covers, in the order they ran. */
function answeredBy(steps: WholeStep[], agent: Agent, composed: WholeMemory | null): WholeStep[] {
  if (agent.memory !== "own") {
    return [];
  }

  return [...steps]
    .sort((one, other) => one.place - other.place)
    .filter(
      (step) => step.agentId === agent.id && step.state === RUN_STEP_DONE && step.place > (composed?.coversPlace ?? 0),
    );
}
