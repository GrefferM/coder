/** One question of a flow, read back — a conversation is a sequence of them. */
export interface WholeQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** A repeat picks the walk up here, so it goes back to the agent this question stood before. */
  askedAgentId: string;
}
