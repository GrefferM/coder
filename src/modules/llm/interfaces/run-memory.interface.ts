import type { SharedMemory, UnwrittenMemory } from "../../../contracts";

/** Where an agent called as a tool reads the question's shared memory: the record, at the moment of the call. */
export interface RunMemory {
  /**
   * The agent's memory of the question, told in words; empty while nothing has answered, null for a question the record
   * does not hold. A compression the caller's turn made and the record does not hold yet stands in the record's place
   * where it reaches as far.
   */
  sharedMemory(
    runId: string,
    questionId: string,
    agentId: string,
    unwritten: UnwrittenMemory | null,
  ): Promise<SharedMemory | null>;
}
