import type { ChatTurn, TurnMemory } from "../../../contracts";

/**
 * What the model is given, in order: the agent's own thread, then the turn's words, opened by the shared memory where the
 * agent has it — one input, not a second message.
 */
export function turnMessages(memory: TurnMemory, asked: string): ChatTurn[] {
  return [
    ...memory.thread,
    {
      from: "person",
      text: `${memory.shared}${asked}`,
    },
  ];
}
