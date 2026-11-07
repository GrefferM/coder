import type { PackedAttachment } from "../attachments";
import type { Agent } from "../project";
import type { RecordedSound } from "../speech";

/** One question of a conversation as the record takes it: its id, whom it went to, and when. */
export interface AskedQuestion {
  /** The question's id, minted when asked; every step names it. */
  questionId: string;
  /** The agent it went to; name and colour are kept as they were then. */
  agent: Agent;
  asked: string;
  /** The files and folders sent with it, packed as they went into the turn. */
  attached: PackedAttachment[];
  /** The recordings it was said with, kept beside it. */
  recordings: RecordedSound[];
  askedAt: number;
  /** The schedule that put it; null where a person asked. */
  scheduleId: string | null;
}
