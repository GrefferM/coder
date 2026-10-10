import type { Agent } from "../../../contracts";

/** Whose memory is read, from which row and under which question. */
export interface MemoryToRead {
  runId: string | null;
  questionId: string;
  agent: Agent;
}
