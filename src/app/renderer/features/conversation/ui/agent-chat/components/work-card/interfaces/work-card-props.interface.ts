import type { OpenCalls } from "../../../../../hooks";
import type { LiveCall } from "../../../../../../../interfaces";

/** The running turn, and every call it has made so far. */
export interface WorkCardProps {
  agentColor: string;
  startedAt: number;
  calls: LiveCall[];
  /** Which of them stand open — the chat's own memory, not this card's. */
  openCalls: OpenCalls;
}
