import type { WaitingAgent } from "../../../../../interfaces";

/** Whom the stream is aimed at, as the chat needs to know it: who they are and how they stand today. */
export interface ChatAimed {
  /** The one a question goes to; nobody where the stream is aimed at no agent. */
  id: string | null;
  name: string;
  color: string;
  isActive: boolean;
  /** Set while this agent holds work at a converging point. */
  waiting: WaitingAgent | null;
}
