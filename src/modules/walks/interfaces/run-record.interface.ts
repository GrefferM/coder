import type { AskedQuestion, OpenedRecord, SharedMemory, WholeRun, WrittenStep } from "../../../contracts";

export interface RunRecord {
  open(directory: string, question: AskedQuestion): Promise<OpenedRecord>;
  /** False when the row is gone. */
  askAgain(runId: string, question: AskedQuestion): Promise<boolean>;
  step(step: WrittenStep): Promise<string>;
  close(runId: string, endedAt: number): Promise<void>;
  read(runId: string): Promise<WholeRun | null>;
  /** What the agent's shared memory of the question tells; null for a run or a question the record lost. */
  sharedMemory(runId: string, questionId: string, agentId: string): Promise<SharedMemory | null>;
}
