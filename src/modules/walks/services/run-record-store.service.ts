import type { RunReader, RunWriter } from "../../runs";
import type {
  AskedQuestion,
  OpenedRecord,
  OwnThread,
  SharedMemory,
  UnwrittenMemory,
  WholeRun,
  WrittenStep,
} from "../../../contracts";
import type { RunRecord } from "../interfaces";

/** The record a walk writes, kept by the run services. */
export class RunRecordStore implements RunRecord {
  constructor(
    private readonly writer: RunWriter,
    private readonly reader: RunReader,
  ) {}

  async open(directory: string, question: AskedQuestion): Promise<OpenedRecord> {
    return this.writer.open({
      directory,
      questionId: question.questionId,
      startedByAgentId: question.agent.id,
      startedByAgentName: question.agent.name,
      startedByAgentColor: question.agent.color,
      startedByScheduleId: question.scheduleId,
      asked: question.asked,
      attached: question.attached,
      recordings: question.recordings,
      startedAt: question.askedAt,
    });
  }

  async askAgain(runId: string, question: AskedQuestion): Promise<boolean> {
    const id = await this.writer.askAgain({
      runId,
      questionId: question.questionId,
      asked: question.asked,
      askedAgentId: question.agent.id,
      askedAgentName: question.agent.name,
      attached: question.attached,
      recordings: question.recordings,
      askedAt: question.askedAt,
    });

    return id !== null;
  }

  async step(step: WrittenStep): Promise<string> {
    return this.writer.step(step);
  }

  async close(runId: string, endedAt: number): Promise<void> {
    await this.writer.close({
      runId,
      endedAt,
    });
  }

  async read(runId: string): Promise<WholeRun | null> {
    return this.reader.one(runId);
  }

  async ownThread(runId: string, agentId: string): Promise<OwnThread | null> {
    return this.reader.ownThread(runId, agentId);
  }

  async sharedMemory(
    runId: string,
    questionId: string,
    agentId: string,
    unwritten: UnwrittenMemory | null = null,
  ): Promise<SharedMemory | null> {
    return this.reader.sharedMemory(runId, questionId, agentId, unwritten);
  }
}
