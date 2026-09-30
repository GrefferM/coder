/** A turn's length in characters, measured before it goes. */
export interface TurnLength {
  /** The system prompt, or zero where the agent has none. */
  prompt: number;
  /** The question this turn carries: the person's words, or work that came down a line. */
  asked: number;
  /** The two of them together: what would have gone. */
  total: number;
  /** The number written on the model. */
  ceiling: number;
}
