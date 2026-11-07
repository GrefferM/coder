import { RECORD_GONE_NOTE, callEnd, notStartedOf } from "../../../contracts";
import { fedStepIds } from "../logic";
import type { AskedQuestion, RunLedger, WrittenTurn } from "../../../contracts";
import type { QuestionToWrite, RecordWatcher, RunRecord } from "../interfaces";

/** A row for a question to go into, and whether this question opened it. */
interface QuestionRow {
  row: Promise<string>;
  isOpening: boolean;
}

/**
 * The record of one stream, written by one hand. Each walk has its own chain (question, steps in order, closing) and
 * the stream keeps the tail of all, so a reader can wait for everything written.
 */
export class RecordWriter {
  private readonly ledgers = new Map<string, RunLedger>();
  /** The row this stream opened, awaited by every walk after the first; a refused opening leaves none. */
  private opening: Promise<string> | null = null;
  /** The last write of each walk, kept after the walk is over because a repeat asks for its own walk's writes. */
  private readonly chains = new Map<string, Promise<void>>();
  private tail: Promise<void> = Promise.resolve();

  constructor(
    private readonly record: RunRecord,
    private readonly watcher: RecordWatcher,
  ) {}

  /** The walks being written, by walk id. */
  walks(): Record<string, RunLedger> {
    return Object.fromEntries(this.ledgers);
  }

  hold(runKey: string, ledger: RunLedger): void {
    this.ledgers.set(runKey, ledger);
  }

  drop(runKey: string): void {
    this.ledgers.delete(runKey);
  }

  /** Ends the record the stream has opened, which otherwise lasts as long as the conversation. */
  forgetOpening(): void {
    this.opening = null;
  }

  /** Writes the walk's question into its row, opening the row where the stream has none. */
  askQuestion(question: QuestionToWrite): Promise<void> {
    const { ledger, agent, text, attached, recordings, runKey, scheduleId } = question;
    const asked: AskedQuestion = {
      questionId: ledger.questionId,
      agent,
      asked: text,
      attached,
      recordings,
      askedAt: ledger.askedAt,
      scheduleId,
    };
    // The row is settled when the question is asked, not when the queue reaches it.
    const placed = this.rowOf(question, asked);
    const written = ledger.queue
      .then(() => this.writeQuestion(question, asked, placed))
      .then(() => this.watcher.written());

    return this.chain(ledger, runKey, written);
  }

  /** Writes one finished step; resolves with its id. */
  writeTurn(ledger: RunLedger, runKey: string, turn: WrittenTurn): Promise<string> {
    const written = ledger.queue.then(() => this.oneStep(ledger, turn));

    this.chain(
      ledger,
      runKey,
      written.then(() => this.watcher.written()),
    );

    return written;
  }

  /** The row closes with its walk; a conversation walks one walk at a time, so no other walk of this row is going. */
  closeWalk(ledger: RunLedger, runKey: string, endedAt: number): Promise<void> {
    const closed = ledger.queue.then(() => this.closeRow(ledger, endedAt)).then(() => this.watcher.written());

    return this.chain(ledger, runKey, closed);
  }

  /** Waits until everything one walk wrote, or the whole stream, has landed or been refused. */
  async settled(runKey?: string): Promise<void> {
    const last = runKey === undefined ? this.tail : this.chains.get(runKey);

    await last?.then(
      () => undefined,
      () => undefined,
    );
  }

  /** One more write of this walk, chained after all its earlier writes. */
  private chain(ledger: RunLedger, runKey: string, written: Promise<void>): Promise<void> {
    ledger.queue = written;
    this.chains.set(runKey, written);
    this.tail = written;

    return written;
  }

  /** The walk's own row, the one this stream is opening, or a new one. */
  private rowOf(question: QuestionToWrite, asked: AskedQuestion): QuestionRow {
    const { ledger } = question;

    if (ledger.runId !== null) {
      return {
        row: Promise.resolve(ledger.runId),
        isOpening: false,
      };
    }

    if (this.opening !== null) {
      return {
        row: this.opening,
        isOpening: false,
      };
    }

    this.opening = this.open(question, asked);

    return {
      row: this.opening,
      isOpening: true,
    };
  }

  private open(question: QuestionToWrite, asked: AskedQuestion): Promise<string> {
    return this.record.open(question.directory, asked).then(
      (opened) => {
        this.tell(question.runKey, opened.runId);

        return opened.runId;
      },
      (failure: unknown) => {
        this.opening = null;

        throw failure;
      },
    );
  }

  /** A put-away stream tells the screen nothing. */
  private tell(runKey: string, runId: string): void {
    if (!this.watcher.isPutAway(runKey)) {
      this.watcher.learnRow(runKey, runId);
    }
  }

  private async writeQuestion(question: QuestionToWrite, asked: AskedQuestion, placed: QuestionRow): Promise<void> {
    const { ledger, directory, runKey } = question;

    ledger.runId = await placed.row;

    // A question that opened the row is written with it.
    if (placed.isOpening) {
      return;
    }

    if (await this.record.askAgain(ledger.runId, asked)) {
      return;
    }

    // The row was deleted by hand: this question opens a new one.
    this.watcher.forgetRow(ledger.runId);
    this.opening = null;

    const reopened = await this.record.open(directory, asked);

    ledger.runId = reopened.runId;
    this.tell(runKey, reopened.runId);
  }

  private async closeRow(ledger: RunLedger, endedAt: number): Promise<void> {
    if (ledger.runId !== null) {
      await this.record.close(ledger.runId, endedAt);
    }
  }

  /** One finished step written into the run its question opened, naming what fed it. */
  private async oneStep(ledger: RunLedger, turn: WrittenTurn): Promise<string> {
    if (ledger.runId === null) {
      throw new Error(RECORD_GONE_NOTE);
    }

    const stepId = await this.record.step({
      runId: ledger.runId,
      questionId: ledger.questionId,
      walkId: ledger.walkId,
      agentId: turn.agent.id,
      agentName: turn.agent.name,
      agentColor: turn.agent.color,
      modelId: turn.model?.id ?? "",
      model: turn.model?.title ?? "",
      providerId: turn.model?.provider ?? "",
      inputPrice: turn.model?.inputPrice ?? null,
      outputPrice: turn.model?.outputPrice ?? null,
      contextCeiling: turn.model?.contextCeiling ?? null,
      answerCeiling: turn.model?.answerCeiling ?? null,
      promptId: turn.agent.promptId,
      prompt: turn.prompt,
      temperature: turn.agent.temperature,
      maxCalls: turn.agent.maxCalls,
      memoryLength: turn.memoryLength,
      asked: turn.asked,
      said: turn.said,
      state: turn.state,
      waitsFor: turn.waitsFor,
      inputTokens: turn.cost?.inputTokens ?? 0,
      outputTokens: turn.cost?.outputTokens ?? 0,
      // A turn that never began cost zero, not an unknown.
      money: turn.cost?.money ?? (notStartedOf(turn.state) === null ? null : 0),
      fromStepIds: fedStepIds(ledger, turn.incoming),
      handoffs: turn.handoffs,
      startedAt: turn.startedAt,
      endedAt: turn.endedAt,
      calls: turn.calls.map((call) => ({
        ...call,
        end: callEnd(call),
      })),
      memories: turn.memories,
    });

    ledger.stepIdOf[turn.agent.id] = stepId;

    return stepId;
  }
}
