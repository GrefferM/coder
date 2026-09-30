/** One question of a flow; a conversation is a sequence of them, and every step names one. */
export interface RunQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** Whom this question was put to; a repeat resumes the walk from this agent. */
  askedAgentId: string;
}
