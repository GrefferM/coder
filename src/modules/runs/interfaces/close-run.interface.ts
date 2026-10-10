/** A run ending; the outcome is counted from its steps on read, not written. */
export interface CloseRun {
  runId: string;
  /** When the last turn of the walk came back, not when the last write finished. */
  endedAt: number;
}
