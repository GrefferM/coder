import type { ChatStopReason } from "../../../interfaces";

/** One row about a link: to whom, from whom, and why it did not go. */
export interface HandoffSaid {
  /** The row's own id, minted where it is said. */
  id: string;
  runKey: string;
  /** Empty where the row is about the person's own question, which nobody sent. */
  fromAgentId: string | null;
  toAgentId: string;
  stopReason: ChatStopReason | null;
  questionId: string;
  askedAt: number;
  /** When the row was said; the stream orders one block's words by it. */
  at: number;
}
