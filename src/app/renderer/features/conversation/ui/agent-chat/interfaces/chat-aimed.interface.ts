import type { WaitingAgent } from "../../../../../interfaces";

/** Whom the stream is aimed at: who they are and how they stand today. */
export interface ChatAimed {
  /** The agent a question goes to; `null` when none is aimed at. */
  id: string | null;
  name: string;
  color: string;
  isActive: boolean;
  /** Set while this agent holds work at a converging point. */
  waiting: WaitingAgent | null;
}
