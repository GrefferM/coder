/** One question of a flow — a conversation is a sequence of them, and every step names one. */
export interface RunQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /**
   * Whom this question was put to. A repeat picks the walk up from here, so it goes back to the agent
   * that very question stood before — not to whoever the flow happened to begin with.
   */
  askedAgentId: string;
}
