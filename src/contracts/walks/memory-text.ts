import { COMPOSER_MEMORY_AGENT, COMPOSER_MEMORY_PERSON } from "./composer-words.constant";
import type { TurnMemory } from "./turn-memory.interface";

/**
 * A memory as one text for the composer to read: the composer's earlier message, the thread's turns each told by who
 * said it, then the shared memory. The task the memory is closed on in a turn is the turn's own, so it is not in it.
 */
export function memoryText(memory: TurnMemory): string {
  return [
    memory.composed,
    ...memory.thread.map(
      (turn) => `${turn.from === "person" ? COMPOSER_MEMORY_PERSON : COMPOSER_MEMORY_AGENT}\n${turn.text}`,
    ),
    memory.shared,
  ]
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join("\n\n");
}
