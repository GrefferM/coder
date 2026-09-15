/**
 * One turn of the conversation on screen, still out — whose it is and since when. What it is saying arrives token
 * by token and stands apart (`useLiveAnswer`), so this list is still while a turn talks, and a turn of another
 * conversation is not in it at all.
 */
export interface WorkingAgent {
  /** The turn itself, by its own id — the same agent may hold several at once. */
  turnId: string;
  agentId: string;
  startedAt: number;
  /** The question this turn grew from, so the card stands in that question's block. */
  questionId: string;
  askedAt: number;
}
