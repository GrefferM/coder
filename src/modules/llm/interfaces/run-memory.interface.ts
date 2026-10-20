import type { SharedMemory } from "../../../contracts";

/** Where an agent called as a tool reads the question's shared memory: the record, at the moment of the call. */
export interface RunMemory {
  /** The agent's memory of the question, told in words; empty while nothing has answered, null for a question the record does not hold. */
  sharedMemory(runId: string, questionId: string, agentId: string): Promise<SharedMemory | null>;
}
