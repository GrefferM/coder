/** One walk being written; its row was opened by the question it grew from. */
export interface RunLedger {
  /** This walk's own id, written with every step it lays down. */
  walkId: string;
  /** When the question this walk grew from was asked; all its words stand in that block. */
  askedAt: number;
  /** The id of the row, once a step has opened it. */
  runId: string | null;
  /** The question this walk is written against, by the id minted when it was asked. */
  questionId: string;
  /** Turns of this run still out; the run ends when the last comes back. */
  out: number;
  /** The last step each agent wrote in this run, so the next can name where its work came from. */
  stepIdOf: Record<string, string>;
  /** Writes go one after another: a step needs the id of the step that fed it. */
  queue: Promise<void>;
}
