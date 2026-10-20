import { RUN_STEP_DONE } from "../../../contracts";
import type { AskedQuestion, OpenedRecord, SharedMemory, WholeRun, WrittenStep } from "../../../contracts";
import type { RunRecord } from "../interfaces";

/** A record held in memory: what a walk wrote, for a spec to read back. */
export class MemoryRecord implements RunRecord {
  readonly questions: AskedQuestion[] = [];
  readonly steps: WrittenStep[] = [];
  readonly closed: Array<{ runId: string; endedAt: number }> = [];
  opened = 0;

  async open(_directory: string, question: AskedQuestion): Promise<OpenedRecord> {
    this.opened += 1;
    this.questions.push(question);

    return {
      runId: `run-${this.opened}`,
      questionId: question.questionId,
    };
  }

  async askAgain(_runId: string, question: AskedQuestion): Promise<boolean> {
    this.questions.push(question);

    return true;
  }

  async step(step: WrittenStep): Promise<string> {
    this.steps.push(step);

    return `step-${this.steps.length}`;
  }

  async close(runId: string, endedAt: number): Promise<void> {
    this.closed.push({
      runId,
      endedAt,
    });
  }

  async read(_runId: string): Promise<WholeRun | null> {
    return null;
  }

  async sharedMemory(_runId: string, _questionId: string, _agentId: string): Promise<SharedMemory | null> {
    return {
      text: "",
      coversPlace: 0,
    };
  }

  states(): string[] {
    return this.steps.map((step) => step.state);
  }

  answeredAll(): boolean {
    return this.steps.every((step) => step.state === RUN_STEP_DONE);
  }
}
