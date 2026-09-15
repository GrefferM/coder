import type { ChatCost } from "./chat-cost.interface";

/** What an agent is asked: a person's question is words alone; work from a link also carries the sender's turn. */
export interface IncomingWork {
  text: string;
  cost: ChatCost | null;
  fromAgentId: string | null;
  /** The recorded steps this work came from, where a walk is being picked up out of the record. */
  fromStepIds: string[];
  /** The sender's turn in seconds; `null` when a person asked. */
  seconds: number | null;
}
