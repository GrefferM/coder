import type { Agent, CallOut, WaitingAgent, WorkingAgent } from "../../../../../../interfaces";

/** What the agent is doing this moment — each of the three said by a pill of its own. */
export interface SphereDoing {
  /** The turn of the walk on screen it is working, if any. */
  working: WorkingAgent | null;
  /** The work it holds while its suppliers have their turns, if any. */
  waiting: WaitingAgent | null;
  /** What this agent has out — a pill beside the sphere; null while it calls nothing. */
  calling: CallOut | null;
  /** The wait names whom it waits for, so it has to look their names up. */
  agents: Agent[];
}
