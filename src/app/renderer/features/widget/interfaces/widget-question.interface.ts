import type { PackedAttachment } from "../../../../../contracts";
import type { HeardClip } from "../../speech";

/** One question put to a sphere, by its agent's id, with what goes beside it. */
export interface WidgetQuestion {
  agentId: string;
  text: string;
  attached: PackedAttachment[];
  /** The recordings it was said with; none for a typed question or a repeat. */
  clips: HeardClip[];
}
