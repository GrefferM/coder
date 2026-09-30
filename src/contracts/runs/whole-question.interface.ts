/** One question of a flow, read back; a conversation is a sequence of them. */
export interface WholeQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** The agent this question stood before; a repeat resumes the walk there. */
  askedAgentId: string;
}
