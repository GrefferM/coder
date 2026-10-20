import { codePoints } from "./code-points";
import type { TurnMemory } from "./turn-memory.interface";

/**
 * A memory's length in characters, as the ceiling counts it: the composer's message, the thread's inputs and answers,
 * and the shared memory.
 */
export function memoryLength(memory: TurnMemory): number {
  return memory.thread.reduce(
    (sum, turn) => sum + codePoints(turn.text),
    codePoints(memory.composed) + codePoints(memory.shared),
  );
}
