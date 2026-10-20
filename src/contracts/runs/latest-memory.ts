import type { WholeMemory } from "./whole-memory.interface";

/**
 * The compression that stands for one memory: of an agent's own thread in the conversation (`questionId` null) or of
 * its shared memory of one question, the one paid in the latest step. Null while none has been written.
 */
export function latestMemory(memories: WholeMemory[], agentId: string, questionId: string | null): WholeMemory | null {
  return memories
    .filter((memory) => memory.agentId === agentId && memory.questionId === questionId)
    .reduce<WholeMemory | null>(
      (standing, memory) => (standing === null || memory.stepPlace > standing.stepPlace ? memory : standing),
      null,
    );
}
