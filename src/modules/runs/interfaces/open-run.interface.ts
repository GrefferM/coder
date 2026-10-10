import type { PackedAttachment } from "../../../contracts";

/** A run beginning: its project, whom the person asked, and what. */
export interface OpenRun {
  directory: string;
  startedByAgentId: string;
  /** That agent's name and colour then; the row is named by this, not a later step. */
  startedByAgentName: string;
  startedByAgentColor: string;
  /** The question's own id, minted when it was asked. */
  questionId: string;
  asked: string;
  /** The files and folders sent with the question, in the order they were glued in. */
  attached: PackedAttachment[];
  /** When the person asked, not when the first step landed. */
  startedAt: number;
}
