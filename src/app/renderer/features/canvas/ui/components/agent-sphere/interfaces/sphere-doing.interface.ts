import type { Agent, CallOut, WaitingAgent, WorkingAgent } from "../../../../../../interfaces";

/** What the agent is doing now; each of the three has its own pill. */
export interface SphereDoing {
  /** The turn of the walk on screen it is working, if any. */
  working: WorkingAgent | null;
  /** The work it holds while its suppliers take their turns, if any. */
  waiting: WaitingAgent | null;
  /** What the agent has out, shown as a pill beside the sphere; null while it calls nothing. */
  calling: CallOut | null;
  /** Looked up for the names of whom the wait is for. */
  agents: Agent[];
}
