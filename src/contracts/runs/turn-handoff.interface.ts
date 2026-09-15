import type { ChatStopReason } from "./stop-reason.type";

/** One link out of a turn — whom the work went to, and why it did not go where it did not. */
export interface TurnHandoff {
  toAgentId: string;
  /** Null where the work went through. */
  stopReason: ChatStopReason | null;
}
