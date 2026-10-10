import type { Agent, PackedAttachment } from "../../../contracts";

/** A question the person puts to an agent. */
export interface PutQuestion {
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
}
