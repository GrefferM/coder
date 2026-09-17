import type { Agent } from "../../../interfaces";

/** A line nothing will ever go down, and what stands at either end of it. */
export interface LineNotTaken {
  /** The agent the line runs from, by its own id. */
  fromId: string;
  /** The agent at its far end — the one that will never be asked. */
  to: Agent;
  /** The live suppliers the agent at the far end waits for; under two it is no converging point. */
  awaited: string[];
  /** The agent the person spoke to, from which the walk's reach is worked out. */
  startAgentId: string;
  /** The walk this line belongs to, by its own key. */
  runKey: string;
}
