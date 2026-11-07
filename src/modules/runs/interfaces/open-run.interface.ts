import type { PackedAttachment, RecordedSound } from "../../../contracts";

/** A run beginning: its project, whom the person asked, and what. */
export interface OpenRun {
  directory: string;
  startedByAgentId: string;
  /** That agent's name and colour then; the row is named by this, not a later step. */
  startedByAgentName: string;
  startedByAgentColor: string;
  /** The schedule that put the first question; null where a person asked it. */
  startedByScheduleId: string | null;
  /** The question's own id, minted when it was asked. */
  questionId: string;
  asked: string;
  /** The files and folders sent with the question, in the order they were glued in. */
  attached: PackedAttachment[];
  /** The recordings the question was said with, in the order they were made. */
  recordings: RecordedSound[];
  /** When the person asked, not when the first step landed. */
  startedAt: number;
}
