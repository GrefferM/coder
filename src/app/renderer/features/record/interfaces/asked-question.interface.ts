import type { Agent } from "../../../interfaces";

/** One question of a conversation as the record takes it in: its own id, whom it went to, and when. */
export interface AskedQuestion {
  /** The question's own id, minted when it was asked — every step of it names this. */
  questionId: string;
  /** The agent it went to; its name and colour are kept as they stood then. */
  agent: Agent;
  asked: string;
  askedAt: number;
}
