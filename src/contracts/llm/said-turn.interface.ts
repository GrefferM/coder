import type { TurnCall } from "../runs";

/** What one turn came to: the words, how it ended, and what it counted. */
export interface SaidTurn {
  text: string;
  isStopped: boolean;
  isCallsExhausted: boolean;
  isCeilingHit: boolean;
  inputTokens: number;
  outputTokens: number;
  /** Every call the turn made, in the order it made them. */
  calls: TurnCall[];
}
