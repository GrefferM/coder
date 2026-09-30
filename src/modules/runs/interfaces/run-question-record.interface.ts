/** Columns of `run_questions`; the entity implements it. */
export interface RunQuestionRecord {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** Whom the question was put to; null on older records. */
  askedAgentId: string | null;
  askedAgentName: string | null;
}
