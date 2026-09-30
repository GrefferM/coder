import { useCallback, useRef, useState } from "react";
import { useRecordWriter } from "../use-record-writer";
import type { FlowRecord } from "./interfaces";

/**
 * The record of one conversation: its row and the writer. A row is learnt from the walk's own question or from a run
 * opened in the history; a stream already on a row keeps it when a walk opens another.
 */
export function useFlowRecord(
  /** A walk of this stream opened a row; the walk is told so it can write the rest into it. */
  rowOpened: (runKey: string, runId: string) => void,
  /** Whether the person has left the walk that is writing. */
  isPutAway: (runKey: string) => boolean,
): FlowRecord {
  /** The row this stream writes into; one conversation is one row, and «+ НОВИЙ ЧАТ» ends it. */
  const flowRunId = useRef<string | null>(null);
  const [flowRun, setFlowRun] = useState<string | null>(null);
  /** How many times the record has been written to. */
  const [written, setWritten] = useState(0);

  const writeInto = useCallback((runId: string | null) => {
    flowRunId.current = runId;
    setFlowRun(runId);
  }, []);
  /** The row a walk of this stream opened; a stream with no row takes it, one that has a row keeps it. */
  const learnRow = useCallback(
    (runKey: string, runId: string) => {
      rowOpened(runKey, runId);

      if (flowRunId.current === null) {
        writeInto(runId);
      }
    },
    [rowOpened, writeInto],
  );
  /** A row deleted by hand; the screen lets go of it if it stood on it. */
  const forgetRow = useCallback(
    (runId: string) => {
      if (flowRunId.current === runId) {
        writeInto(null);
      }
    },
    [writeInto],
  );
  const writer = useRecordWriter(
    learnRow,
    forgetRow,
    isPutAway,
    useCallback(() => setWritten((was) => was + 1), []),
  );

  return {
    writer,
    learnRow,
    runId: flowRun,
    written,
    standing: useCallback(() => flowRunId.current, []),
    turnTo: useCallback(
      (runId: string | null) => {
        writeInto(runId);
        // Ends the record, which otherwise lasts as long as the conversation.
        writer.forgetOpening();
      },
      [writeInto, writer],
    ),
  };
}
