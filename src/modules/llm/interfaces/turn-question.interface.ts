/** The row and the question a turn works under; every agent it calls works under the same. */
export interface TurnQuestion {
  /** Null while the conversation has no row yet; there is nothing to read then. */
  runId: string | null;
  questionId: string;
}
