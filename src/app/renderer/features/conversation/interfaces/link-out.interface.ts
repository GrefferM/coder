import type { Agent, ChatStopReason } from "../../../interfaces";

/** One link out of a turn, computed once: whom it leads to and why it cannot be taken. */
export interface LinkOut {
  linkId: string;
  to: Agent;
  stopReason: ChatStopReason | null;
}
