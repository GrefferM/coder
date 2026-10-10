import { AGENT_FIELD_MAX_CALLS, AGENT_FIELD_TEMPERATURE } from "./field-names.constant";
import type { Agent } from "./agent.interface";
import type { FilledAgent } from "./filled-agent.interface";
import type { WrittenNumber } from "./written-number.type";

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
