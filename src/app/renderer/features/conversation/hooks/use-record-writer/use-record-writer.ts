import { useCallback, useRef } from "react";
import { askAgain, closeRun, openRun, writeStep } from "../../../record";
import { callEnd, fedStepIds, notStartedOf } from "../../logic";
import type { RecordWriter } from "./interfaces";
import type { Agent } from "../../../../interfaces";
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
  /** The row this stream opened, awaited by every walk after the first. */
  const opening = useRef<Promise<string | null> | null>(null);
  /**
   * The last write of each walk, by walk id; kept after the walk is over because a repeat asks for its own walk's writes.
   */
  const chains = useRef<Record<string, Promise<void>>>({});
  const tail = useRef<Promise<void>>(Promise.resolve());

  /** One more write of this walk, chained after all its earlier writes. */
  const chain = (ledger: RunLedger, runKey: string, written: Promise<void>): Promise<void> => {
    ledger.queue = written;
    chains.current = {
      ...chains.current,
      [runKey]: written,
    };

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
    (ledger: RunLedger, directory: string, agent: Agent, text: string, runKey: string) => {
      const asked: AskedQuestion = {
        questionId: ledger.questionId,
        agent,
        asked: text,
        askedAt: ledger.askedAt,
      };
      // The row is settled when the question is asked, not when the queue reaches it, so «+ НОВИЙ ЧАТ» in between
      // cannot leave it without a row.
      const isOpening = ledger.runId === null && opening.current === null;

      if (isOpening) {
        opening.current = openRun(directory, asked).then((opened) => {
          // The row this stream's own question opened; a put-away stream tells the screen nothing.
          if (opened !== null && !isPutAway(runKey)) {
            learnRow(runKey, opened.runId);
          }

          return opened?.runId ?? null;
        });
      }

      const opened = ledger.runId === null ? opening.current : Promise.resolve(ledger.runId);

      const writeQuestion = async () => {
        const runId = (await opened) ?? null;

        ledger.runId = runId;

        // A question that opened the row is written with it; nothing to add to a row that never opened.
        if (runId === null || isOpening) {
          return;
        }

        if (await askAgain(runId, asked)) {
          return;
        }

        // The row was deleted by hand; the next question opens a new one.
        ledger.runId = null;
        forgetRow(runId);
        opening.current = null;
      };

      chain(
        ledger,
        runKey,
        ledger.queue.then(writeQuestion).then(() => {
          // A question is a record word too; readers read again now.
          onWritten();
        }),
      );
    },
    [forgetRow, isPutAway, learnRow, onWritten],
  );

  const writeTurn = useCallback(
    (ledger: RunLedger, runKey: string, turn: WrittenTurn, onStep: (stepId: string) => void) => {
      tail.current = chain(
        ledger,
        runKey,
        ledger.queue
          .then(() => oneStep(ledger, turn))
          .then((stepId) => {
            if (stepId !== null) {
              onStep(stepId);
            }

            onWritten();
          }),
      );
    },
    [onWritten],
  );

  const closeWalk = useCallback(
    (ledger: RunLedger, runKey: string, endedAt: number) => {
      // The row closes with its walk; a conversation walks one walk at a time, so no other walk of this row is still
      // going.
      tail.current = chain(
        ledger,
        runKey,
        ledger.queue
          .then(async () => {
            if (ledger.runId !== null) {
              await closeRun(ledger.runId, endedAt);
            }
          })
          .then(onWritten),
      );
    },
    [onWritten],
  );

  /**
   * Everything one walk wrote, so a repeat reads a record holding what just happened; only its own walk, not another
   * conversation's.
   */
  const settled = useCallback(async (runKey?: string) => {
    await (runKey === undefined ? tail.current : chains.current[runKey]);
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
async function oneStep(ledger: RunLedger, turn: WrittenTurn): Promise<string | null> {
  // The question opened the row ahead of this write; without one there is nowhere to write.
  if (ledger.runId === null) {
    return null;
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

  if (stepId !== null) {
    ledger.stepIdOf[turn.agent.id] = stepId;
  }

  return stepId;
}
