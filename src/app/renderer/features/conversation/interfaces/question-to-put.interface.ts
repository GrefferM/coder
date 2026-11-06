import type { Agent, PackedAttachment } from "../../../interfaces";
import type { HeardClip } from "../../speech";

/** One question put to an agent, with what goes beside it. */
export interface QuestionToPut {
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
  /** The recordings it was said with; none for a repeat. */
  clips: HeardClip[];
}
