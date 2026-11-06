import type { PackedAttachment, RecordedSound } from "../../../contracts";

/** Another question in an already recorded flow. */
export interface AskAgain {
  runId: string;
  /** The question's own id, minted when it was asked. */
  questionId: string;
  /** The newest question, which is the row's text. */
  asked: string;
  /** The files and folders sent with the question, in the order they were glued in. */
  attached: PackedAttachment[];
  /** The recordings the question was said with, in the order they were made. */
  recordings: RecordedSound[];
  /** Whom this question is put to; it names the row's head. */
  askedAgentId: string;
  /** That agent's current name, kept after the agent is gone. */
  askedAgentName: string;
  /** When the person asked again; the run is open from then until closed. */
  askedAt: number;
}
