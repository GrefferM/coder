import { useCallback, useRef } from "react";
import { RECORD_GONE_NOTE, askAgain, closeRun, openRun, writeStep } from "../../../record";
import { callEnd, fedStepIds, notStartedOf } from "../../logic";
import type { RecordWriter } from "./interfaces";
import type { Agent, PackedAttachment } from "../../../../interfaces";
import type { AskedQuestion } from "../../../record";
import type { RunLedger, WrittenTurn } from "../../interfaces";

/**
 * The record of one stream, written by one hand. Each walk has its own chain (question, steps in order, closing) and
 * the stream keeps the tail of all, so a reader can wait for everything written.
 */
export function useRecordWriter(
  learnRow: (runKey: string, runId: string) => void,
  forgetRow: (runId: string) => void,
  isPutAway: (runKey: string) => boolean,
  onWritten: () => void,
): RecordWriter {
  const walks = useRef<Record<string, RunLedger>>({});
  /** The row this stream opened, awaited by every walk after the first; a refused opening leaves none. */
  const opening = useRef<Promise<string> | null>(null);
  /**
   * The last write of each walk, by walk id; kept after the walk is over because a repeat asks for its own walk's writes.
   */
  const chains = useRef<Record<string, Promise<void>>>({});
  const tail = useRef<Promise<void>>(Promise.resolve());

  /** One more write of this walk, chained after all its earlier writes; a refused write ends the walk's chain. */
  const chain = (ledger: RunLedger, runKey: string, written: Promise<void>): Promise<void> => {
    ledger.queue = written;
    chains.current = {
      ...chains.current,
      [runKey]: written,
    };
    tail.current = written;

    return written;
  };

  const hold = useCallback((runKey: string, ledger: RunLedger) => {
    walks.current = {
      ...walks.current,
      [runKey]: ledger,
    };
  }, []);

  const drop = useCallback((runKey: string) => {
    const rest = {
      ...walks.current,
    };

    delete rest[runKey];
    walks.current = rest;
  }, []);

  const askQuestion = useCallback(
    (
      ledger: RunLedger,
      directory: string,
      agent: Agent,
      text: string,
      attached: PackedAttachment[],
      runKey: string,
    ): Promise<void> => {
      const asked: AskedQuestion = {
        questionId: ledger.questionId,
        agent,
        asked: text,
        attached,
        askedAt: ledger.askedAt,
      };
      let isOpening = false;

      /** The row this question goes into: the walk's own, the one this stream is opening, or a new one. */
      const rowOf = (): Promise<string> => {
        if (ledger.runId !== null) {
          return Promise.resolve(ledger.runId);
        }

        // The row is settled when the question is asked, not when the queue reaches it, so «+ НОВИЙ ЧАТ» in between
        // cannot leave it without a row.
        if (opening.current === null) {
          isOpening = true;
          opening.current = openRun(directory, asked).then(
            (opened) => {
              // The row this stream's own question opened; a put-away stream tells the screen nothing.
              if (!isPutAway(runKey)) {
                learnRow(runKey, opened.runId);
              }

              return opened.runId;
            },
            (failure: unknown) => {
              opening.current = null;

              throw failure;
            },
          );
        }

        return opening.current;
      };
      const row = rowOf();

      const writeQuestion = async () => {
        ledger.runId = await row;

        // A question that opened the row is written with it.
        if (isOpening) {
          return;
        }

        if (await askAgain(ledger.runId, asked)) {
          return;
        }

        // The row was deleted by hand: this question opens a new one.
        forgetRow(ledger.runId);
        opening.current = null;

        const reopened = await openRun(directory, asked);

        ledger.runId = reopened.runId;

        if (!isPutAway(runKey)) {
          learnRow(runKey, reopened.runId);
        }
      };

      // A question is a record word too; readers read again now.
      return chain(ledger, runKey, ledger.queue.then(writeQuestion).then(onWritten));
    },
    [forgetRow, isPutAway, learnRow, onWritten],
  );

  const writeTurn = useCallback(
    (ledger: RunLedger, runKey: string, turn: WrittenTurn): Promise<string> => {
      const written = ledger.queue.then(() => oneStep(ledger, turn));

      chain(ledger, runKey, written.then(onWritten));

      return written;
    },
    [onWritten],
  );

  const closeWalk = useCallback(
    (ledger: RunLedger, runKey: string, endedAt: number): Promise<void> =>
      // The row closes with its walk; a conversation walks one walk at a time, so no other walk of this row is still
      // going.
      chain(
        ledger,
        runKey,
        ledger.queue
          .then(async () => {
            if (ledger.runId !== null) {
              await closeRun(ledger.runId, endedAt);
            }
          })
          .then(onWritten),
      ),
    [onWritten],
  );

  /**
   * Waits until everything one walk wrote, or the whole stream, has landed or been refused; a refusal is said on its own
   * card. Only that walk's own, not another conversation's.
   */
  const settled = useCallback(async (runKey?: string) => {
    await (runKey === undefined ? tail.current : chains.current[runKey])?.then(
      () => undefined,
      () => undefined,
    );
  }, []);

  return {
    walks: useCallback(() => walks.current, []),
    hold,
    drop,
    askQuestion,
    writeTurn,
    closeWalk,
    settled,
    forgetOpening: useCallback(() => {
      opening.current = null;
    }, []),
  };
}

/** One finished step written into the run its question opened, naming what fed it. */
async function oneStep(ledger: RunLedger, turn: WrittenTurn): Promise<string> {
  // The question opened the row ahead of this write.
  if (ledger.runId === null) {
    throw new Error(RECORD_GONE_NOTE);
  }

  const stepId = await writeStep({
    runId: ledger.runId,
    // The question this step grew from.
    questionId: ledger.questionId,
    // The walk it ran in, so a repeat knows the last walk's steps.
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
    // What the turn ran with, as it stood then: the prompt and the two numbers.
    promptId: turn.agent.promptId,
    prompt: turn.prompt,
    temperature: turn.agent.temperature,
    maxCalls: turn.agent.maxCalls,
    memoryLength: turn.memoryLength,
    asked: turn.asked,
    said: turn.said,
    state: turn.state,
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
  });

  ledger.stepIdOf[turn.agent.id] = stepId;

  return stepId;
}
