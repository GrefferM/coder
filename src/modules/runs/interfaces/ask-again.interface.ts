import type { PackedAttachment } from "../../../contracts";

/** Another question in an already recorded flow. */
export interface AskAgain {
  runId: string;
  /** The question's own id, minted when it was asked. */
  questionId: string;
  /** The newest question, which is the row's text. */
  asked: string;
  /** The files and folders sent with the question, in the order they were glued in. */
  attached: PackedAttachment[];
  /** Whom this question is put to; it names the row's head from now on. */
  askedAgentId: string;
  /** That agent's current name, kept after the agent is gone. */
  askedAgentName: string;
  /** When the person asked again; the run is open from then until closed. */
  askedAt: number;
}
