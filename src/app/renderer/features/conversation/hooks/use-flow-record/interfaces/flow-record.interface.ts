import type { RecordWriter } from "../../use-record-writer";

/**
 * The record one conversation writes into: which row it is, how much has gone into it, and the one hand
 * that writes there. One conversation is one row, and the person's word — a run opened, «+ НОВИЙ ЧАТ» — is
 * the only thing that moves the stream to another; a walk writing a step never moves it.
 */
export interface FlowRecord {
  /** The one hand that writes this stream's record; the walk says what happened, it writes it down. */
  writer: RecordWriter;
  /** The row the stream writes into, as the drawn render sees it. */
  runId: string | null;
  /** The same row as a callback sees it — a turn starting must read the row now, not the drawn one. */
  standing: () => string | null;
  /** How many times the record has been written to — what the history reads to know when to read it again. */
  written: number;
  /**
   * A walk of this stream now stands on a row — one it opened, or one it was picked up out of. A stream
   * standing on no row of its own takes it too; one that has one keeps it.
   */
  learnRow: (runKey: string, runId: string) => void;
  /** The person turned this stream to another row, or to none; the row it had opened is no longer its own. */
  turnTo: (runId: string | null) => void;
}
