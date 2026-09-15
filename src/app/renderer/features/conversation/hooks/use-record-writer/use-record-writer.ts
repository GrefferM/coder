import { useCallback, useRef } from "react";
import { askAgain, closeRun, openRun, writeStep } from "../../../record";
import { callEnd, fedStepIds, notStartedOf } from "../../logic";
import type { RecordWriter } from "./interfaces";
import type { Agent } from "../../../../interfaces";
import type { RunLedger, WrittenTurn } from "../../interfaces";

/**
 * The record of one stream, written by one hand. Each walk keeps its own chain — question, steps in the order
 * they ran, closing — and the stream keeps the tail of them all, so a reader can wait for everything written.
 */
export function useRecordWriter(
  learnRow: (runKey: string, runId: string) => void,
  forgetRow: (runId: string) => void,
  isPutAway: (runKey: string) => boolean,
  onWritten: () => void,
): RecordWriter {
  const walks = useRef<Record<string, RunLedger>>({});
  /** The row this stream opened, awaited by every walk that follows the first. */
  const opening = useRef<Promise<string | null> | null>(null);
  /**
   * The last write of each walk, by the walk's own id. It outlives the walk in the book above, because a
   * repeat asks for what its own walk wrote after that walk is over — and asks for nobody else's.
   */
  const chains = useRef<Record<string, Promise<void>>>({});
  const tail = useRef<Promise<void>>(Promise.resolve());

  /** One more write of this walk, chained after everything it wrote before. */
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
      // Which row this question is written into is settled the moment it is asked, and not when
      // the queue reaches it: «+ НОВИЙ ЧАТ» in between must not leave the question standing without a row.
      const isOpening = ledger.runId === null && opening.current === null;

      if (isOpening) {
        opening.current = openRun(directory, agent, ledger.questionId, text, ledger.askedAt).then((opened) => {
          // The row this stream's own question opened; a stream the person has already left is none
          // of the screen's business, and says nothing to it.
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

        // A question that opened the row is written with it; there is nothing to add to a row that never opened.
        if (runId === null || isOpening) {
          return;
        }

        if (await askAgain(runId, ledger.questionId, agent, text, ledger.askedAt)) {
          return;
        }

        // The row was deleted by hand while the conversation stood: the next question opens one of its own.
        ledger.runId = null;
        forgetRow(runId);
        opening.current = null;
      };

      chain(
        ledger,
        runKey,
        ledger.queue.then(writeQuestion).then(() => {
          // A question is a word of the record too; whoever reads the record reads it again now.
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
      // The row closes with the walk that was in it. A conversation walks one walk at a time —
      // while one is out nothing is sent into it — so there is never another one of this row still going.
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
   * Everything one walk wrote, so a repeat reads a record that holds what happened a moment ago. Only its
   * own: a conversation still writing its steps is another conversation, and this one does not wait for it.
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
    // Every step of this walk names the question it grew from, whichever of the flow's it is.
    questionId: ledger.questionId,
    // And the walk it ran in, so a repeat knows which steps are the last walk's.
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
    // What the turn ran with, kept as it stood then — the prompt and the two numbers.
    promptId: turn.agent.promptId,
    prompt: turn.prompt,
    temperature: turn.agent.temperature,
    maxCalls: turn.agent.maxCalls,
    asked: turn.asked,
    said: turn.said,
    state: turn.state,
    inputTokens: turn.cost?.inputTokens ?? 0,
    outputTokens: turn.cost?.outputTokens ?? 0,
    // A turn that never began spent nothing, which is a bill of zero and not a number nobody knows.
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
