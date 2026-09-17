import { agentState } from "./agent-state";
import type { AgentState, StateFacts } from "../interfaces";

/** Which state every agent is in, worked out once, so the canvas and the panel say the same thing. */
export function agentStates(facts: StateFacts): Record<string, AgentState> {
  return Object.fromEntries(facts.config.agents.map((agent) => [agent.id, agentState(agent, facts)]));
}
