import type { ChatStopReason } from "./stop-reason.type";

/** One link out of a turn: whom the work went to, or why it did not. */
export interface TurnHandoff {
  toAgentId: string;
  /** Null where the work went through. */
  stopReason: ChatStopReason | null;
  /** What the line carried: the agent's answer, or what `pass_to` handed this agent; empty where it was handed nothing. */
  text: string;
}
