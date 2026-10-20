import {
  AGENT_FIELD_COMPRESS_AT,
  AGENT_FIELD_COMPRESS_TO,
  AGENT_FIELD_MAX_CALLS,
  AGENT_FIELD_TEMPERATURE,
} from "./field-names.constant";
import type { Agent } from "./agent.interface";
import type { FilledAgent } from "./filled-agent.interface";
import type { WrittenNumber } from "./written-number.type";

/**
 * The numbers an agent must carry, in the settings tab's order: the memory's two first, then the run's. The two that
 * compress its memory are asked only while the memory is kept: with none there is nothing to compress, and the file may
 * leave them out.
 */
export function agentNumbers(agent: Agent): WrittenNumber[] {
  const compression: WrittenNumber[] =
    agent.memory === "none"
      ? []
      : [
          [agent.compressAt, AGENT_FIELD_COMPRESS_AT],
          [agent.compressTo, AGENT_FIELD_COMPRESS_TO],
        ];

  return [...compression, [agent.maxCalls, AGENT_FIELD_MAX_CALLS], [agent.temperature, AGENT_FIELD_TEMPERATURE]];
}

/** Whether every number asked of it is written; no turn is asked of another kind of agent. */
export function isAgentFilled(agent: Agent): agent is FilledAgent {
  return agentNumbers(agent).every(([value]) => value !== null);
}
