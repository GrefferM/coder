import type { Agent } from "../project";
import type { ChatStopReason } from "../runs";

/** One link out of a turn, computed once: whom it leads to and why it cannot be taken. */
export interface LinkOut {
  linkId: string;
  to: Agent;
  stopReason: ChatStopReason | null;
}
