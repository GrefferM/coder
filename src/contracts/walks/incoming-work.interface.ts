import type { PackedAttachment } from "../attachments";
import type { ChatCost } from "./chat-cost.interface";

/** What an agent is asked: a person's question is words alone; work from a link also carries the sender's turn. */
export interface IncomingWork {
  text: string;
  cost: ChatCost | null;
  fromAgentId: string | null;
  /** The recorded steps this work came from, when a walk is resumed from the record. */
  fromStepIds: string[];
  /** The sender's turn in seconds; `null` when a person asked. */
  seconds: number | null;
  /** The files and folders attached to a person's question; work down a line carries none. */
  attached: PackedAttachment[];
}
