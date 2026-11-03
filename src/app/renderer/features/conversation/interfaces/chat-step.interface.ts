/** A turn's step in the walk and when it began; by level, not write order: turns that ran at once share a step. */
export interface ChatStep {
  level: number;
  /** When the step began; the message's own `at` is when it ended. */
  at: string;
}
