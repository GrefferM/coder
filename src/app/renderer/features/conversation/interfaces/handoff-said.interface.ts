import type { ChatStopReason } from "../../../interfaces";

/** One row about a link, as the walk says it — who to, from whom, and why it did not go. */
export interface HandoffSaid {
  /** The row's own id, minted where it is said. */
  id: string;
  runKey: string;
  /** Nobody sent the person's own question, so this is empty where the row is about one. */
  fromAgentId: string | null;
  toAgentId: string;
  stopReason: ChatStopReason | null;
  questionId: string;
  askedAt: number;
  /** When the row was said; the stream orders the words of one block by it. */
  at: number;
}
