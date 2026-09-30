/**
 * One turn of the conversation on screen still out: whose it is and since when. Its text arrives apart
 * (`useLiveAnswer`); turns of other conversations are not listed.
 */
export interface WorkingAgent {
  /** The turn's own id; one agent may hold several. */
  turnId: string;
  agentId: string;
  startedAt: number;
  /** The question this turn grew from; the card stands in its block. */
  questionId: string;
  askedAt: number;
}
