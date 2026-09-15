import { useCallback, useRef, useState } from "react";
import { useRecordWriter } from "../use-record-writer";
import type { FlowRecord } from "./interfaces";

/**
 * The record of one conversation — the row it writes into, and the hand that writes there.
 *
 * A row is learnt two ways: the walk's own question opens one, or the person opens one from the history. A
 * stream already standing on a row keeps it when a walk opens another — another conversation must not move
 * the screen.
 */
export function useFlowRecord(
  /** A walk of this stream opened a row; the walk is told so it can write the rest of itself into it. */
  rowOpened: (runKey: string, runId: string) => void,
  /** Whether the person has already left the walk that is writing — a stream they left says nothing here. */
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
  /**
   * The row a walk of this stream opened. The walk writes into it from here on, and a stream standing on
   * no row of its own takes it too — one that has one keeps it.
   */
  const learnRow = useCallback(
    (runKey: string, runId: string) => {
      rowOpened(runKey, runId);

      if (flowRunId.current === null) {
        writeInto(runId);
      }
    },
    [rowOpened, writeInto],
  );
  /** A row deleted by hand while its conversation stood — the screen lets go of it if it stood on it. */
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
        // The record goes on for as long as the conversation does, and this is where that one ends.
        writer.forgetOpening();
      },
      [writeInto, writer],
    ),
  };
}
