import type { RecordWriter } from "../../use-record-writer";

/**
 * The record one conversation writes into: its row, how much has gone into it, and the writer. One conversation is one
 * row; only the person's word (a run opened, «+ НОВИЙ ЧАТ») moves the stream to another.
 */
export interface FlowRecord {
  /** The one writer of this stream's record. */
  writer: RecordWriter;
  /** The row the stream writes into, as the drawn render sees it. */
  runId: string | null;
  /** The same row as a callback sees it, current rather than the drawn one. */
  standing: () => string | null;
  /** Count of writes to the record; the history reads it to know when to read again. */
  written: number;
  /**
   * A walk of this stream stands on a row, opened or picked up; a stream with no row takes it, one that has a row keeps
   * it.
   */
  learnRow: (runKey: string, runId: string) => void;
  /** The person turned this stream to another row or to none; the row it had opened is no longer its own. */
  turnTo: (runId: string | null) => void;
}
