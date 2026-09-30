import type { OpenCalls } from "../../../../../hooks";
import type { LiveCall } from "../../../../../../../interfaces";

/** The running turn, and every call it has made so far. */
export interface WorkCardProps {
  agentColor: string;
  startedAt: number;
  calls: LiveCall[];
  /** Which calls are open; kept by the chat, not this card. */
  openCalls: OpenCalls;
}
