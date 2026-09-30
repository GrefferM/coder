import { agentState } from "./agent-state";
import type { AgentState, StateFacts } from "../interfaces";

/** Every agent's state, computed once for the canvas and the panel. */
export function agentStates(facts: StateFacts): Record<string, AgentState> {
  return Object.fromEntries(facts.config.agents.map((agent) => [agent.id, agentState(agent, facts)]));
}
