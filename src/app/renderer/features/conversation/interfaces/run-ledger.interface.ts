/** One walk being written; the row it writes into was opened by the question it grew from. */
export interface RunLedger {
  /** This walk's own id, written with every step it lays down. */
  walkId: string;
  /** When the question this walk grew from was asked; every word of it stands in that block. */
  askedAt: number;
  /** The id of the row, once a step has opened it. */
  runId: string | null;
  /** The question this walk is written against — its own id, minted when it was asked. */
  questionId: string;
  /** How many turns of this run are still out; the run ends when the last one comes back. */
  out: number;
  /** The last step each agent wrote in this run, so the next one can name where its work came from. */
  stepIdOf: Record<string, string>;
  /** Writes go one after another: a step must know the id of the step that fed it. */
  queue: Promise<void>;
}
