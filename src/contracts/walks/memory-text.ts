import { COMPOSER_MEMORY_AGENT, COMPOSER_MEMORY_PERSON } from "./composer-words.constant";
import { SHARED_MEMORY_TASK } from "./shared-memory.constant";
import type { TurnMemory } from "./turn-memory.interface";

/**
 * A memory as one text for the composer to read: the composer's earlier message, the thread's turns each told by who
 * said it, then the shared memory. The shared memory's closing line addresses the agent whose turn it is, which is not
 * the composer's, so it is left off.
 */
export function memoryText(memory: TurnMemory): string {
  const shared = memory.shared.endsWith(SHARED_MEMORY_TASK)
    ? memory.shared.slice(0, -SHARED_MEMORY_TASK.length)
    : memory.shared;

  return [
    memory.composed,
    ...memory.thread.map(
      (turn) => `${turn.from === "person" ? COMPOSER_MEMORY_PERSON : COMPOSER_MEMORY_AGENT}\n${turn.text}`,
    ),
    shared,
  ]
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join("\n\n");
}
