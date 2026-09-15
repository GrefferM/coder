import { AGENT_MAX_CALLS_DROPPED_LABEL, AGENT_NAME_DROPPED_LABEL, AGENT_TEMPERATURE_DROPPED_LABEL } from "../constants";
import type { AgentDraft } from "../interfaces";

/** Write blockers: the name a person can empty, and the two numbers a file may never have carried. */
export function agentBlocked(draft: AgentDraft): string[] {
  return [
    draft.name.trim() ? null : AGENT_NAME_DROPPED_LABEL,
    draft.maxCalls === null ? AGENT_MAX_CALLS_DROPPED_LABEL : null,
    draft.temperature === null ? AGENT_TEMPERATURE_DROPPED_LABEL : null,
  ].filter((label): label is string => label !== null);
}
