import type { AskedQuestion, OpenedRecord, WholeRun, WrittenStep } from "../../../contracts";

/** What a walk asks of the record: its questions and steps written, its end stamped, its run read back. */
export interface RunRecord {
  open(directory: string, question: AskedQuestion): Promise<OpenedRecord>;
  /** False when the row is gone. */
  askAgain(runId: string, question: AskedQuestion): Promise<boolean>;
  step(step: WrittenStep): Promise<string>;
  close(runId: string, endedAt: number): Promise<void>;
  read(runId: string): Promise<WholeRun | null>;
  sharedMemory(runId: string, questionId: string): Promise<string | null>;
}
