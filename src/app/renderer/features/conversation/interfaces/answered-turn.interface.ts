import type { TurnAnswer } from "./turn-answer.interface";

/** One turn come back, with everything its card is written from. */
export interface AnsweredTurn {
  id: string;
  agentId: string;
  /** The walk this turn ran in. */
  walkId: string;
  /** What this turn was asked and the steps that fed it, for a repeat to resume on. */
  asked: string;
  fedBy: string[];
  /** What the agent said, tidied; the answer's own text is kept as it came. */
  said: string;
  /** The question this turn grew from, and when it was asked. */
  questionId: string;
  askedAt: number;
  startedAt: number;
  endedAt: number;
  answer: TurnAnswer;
}
