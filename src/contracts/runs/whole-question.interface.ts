import type { PackedAttachment } from "../attachments";

/** One question of a flow, read back; a conversation is a sequence of them. */
export interface WholeQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** The agent this question stood before; a repeat resumes the walk there. */
  askedAgentId: string;
  /** The files and folders sent with it, packed as they went; a repeat puts them in again. */
  attached: PackedAttachment[];
}
