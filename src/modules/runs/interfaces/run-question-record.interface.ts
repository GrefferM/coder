/** The columns the `run_questions` table holds; the entity implements it. */
export interface RunQuestionRecord {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** Whom the question was put to; null on a question written before the record kept the addressee. */
  askedAgentId: string | null;
  askedAgentName: string | null;
}
