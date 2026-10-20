import type { AskedQuestion, OpenedRecord, OwnThread, SharedMemory, WholeRun, WrittenStep } from "../../../contracts";

export interface RunRecord {
  open(directory: string, question: AskedQuestion): Promise<OpenedRecord>;
  /** False when the row is gone. */
  askAgain(runId: string, question: AskedQuestion): Promise<boolean>;
  step(step: WrittenStep): Promise<string>;
  close(runId: string, endedAt: number): Promise<void>;
  read(runId: string): Promise<WholeRun | null>;
  /** The agent's own thread: its latest compression and its steps after it; null for a run the record lost. */
  ownThread(runId: string, agentId: string): Promise<OwnThread | null>;
  /** What the agent's shared memory of the question tells; null for a run or a question the record lost. */
  sharedMemory(runId: string, questionId: string, agentId: string): Promise<SharedMemory | null>;
}
