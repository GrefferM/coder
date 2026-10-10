import type { Agent } from "../project";

/** A line nothing will ever go down, and what stands at either end of it. */
export interface LineNotTaken {
  /** The agent the line runs from, by its own id. */
  fromId: string;
  /** The agent at its far end — the one that will never be asked. */
  to: Agent;
  /** Live suppliers the far-end agent waits for; under two it is no converging point. */
  awaited: string[];
  /** The agent the person spoke to; the walk's reach is computed from it. */
  startAgentId: string;
  /** The walk this line belongs to, by its own key. */
  runKey: string;
}
