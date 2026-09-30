import { AGENT_FIELD_MAX_CALLS, AGENT_FIELD_TEMPERATURE } from "../constants";
import type { Agent, FilledAgent, WrittenNumber } from "../interfaces";

/** The two numbers an agent must carry, in the settings tab's order. */
export function agentNumbers(agent: Agent): WrittenNumber[] {
  return [
    [agent.maxCalls, AGENT_FIELD_MAX_CALLS],
    [agent.temperature, AGENT_FIELD_TEMPERATURE],
  ];
}

/** Whether both are written; no turn is asked of another kind of agent. */
export function isAgentFilled(agent: Agent): agent is FilledAgent {
  return agentNumbers(agent).every(([value]) => value !== null);
}
