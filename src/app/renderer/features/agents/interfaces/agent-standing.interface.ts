import type { Agent } from "../../../interfaces";
import type { AgentState } from "./agent-state.interface";

/** What the agent is doing, since when, and who feeds it. */
export interface AgentStanding {
  /** The agent's state, drawn under its name. */
  state: AgentState;
  startedAt: number | null;
  /** Agents whose links come in, switched-off included. */
  suppliers: Agent[];
}
