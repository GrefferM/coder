import type { Agent, PackedAttachment } from "../../../contracts";

export interface PutQuestion {
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
}
