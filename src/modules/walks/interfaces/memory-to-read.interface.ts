import type { Agent } from "../../../contracts";

export interface MemoryToRead {
  runId: string | null;
  questionId: string;
  agent: Agent;
}
