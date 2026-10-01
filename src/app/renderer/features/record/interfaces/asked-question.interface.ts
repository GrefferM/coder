import type { Agent, PackedAttachment } from "../../../interfaces";

/** One question of a conversation as the record takes it: its id, whom it went to, and when. */
export interface AskedQuestion {
  /** The question's id, minted when asked; every step names it. */
  questionId: string;
  /** The agent it went to; name and colour are kept as they were then. */
  agent: Agent;
  asked: string;
  /** The files and folders sent with it, packed as they went into the turn. */
  attached: PackedAttachment[];
  askedAt: number;
}
