import type { TurnMemory } from "./turn-memory.interface";
import type { ChatTurn } from "../llm";

/**
 * What the model is given, in order: the agent's own thread, then the turn's words, opened by the shared memory where the
 * agent has it — one input, not a second message. A compressed thread's message opens the first of them.
 */
export function turnMessages(memory: TurnMemory, asked: string): ChatTurn[] {
  const turns: ChatTurn[] = [
    ...memory.thread,
    {
      from: "person",
      text: `${memory.shared}${asked}`,
    },
  ];

  return turns.map((turn, index) =>
    index === 0
      ? {
          ...turn,
          text: `${memory.composed}${turn.text}`,
        }
      : turn,
  );
}
