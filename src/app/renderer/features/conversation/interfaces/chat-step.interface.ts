/**
 * Which step of the walk a turn was, and when it began. The level and not the order the record was written in:
 * turns that ran at once are one step.
 */
export interface ChatStep {
  level: number;
  /** When the step began; the message's own `at` is when it ended. */
  at: string;
}
