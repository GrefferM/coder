import {
  AGENT_COMPRESS_AT_DROPPED_LABEL,
  AGENT_COMPRESS_TO_DROPPED_LABEL,
  AGENT_MAX_CALLS_DROPPED_LABEL,
  AGENT_NAME_DROPPED_LABEL,
  AGENT_TEMPERATURE_DROPPED_LABEL,
} from "../constants";
import { keepsMemory } from "../../../../../contracts";
import type { AgentDraft } from "../interfaces";

/**
 * Write blockers, in the order the tab shows them: an emptied name and the numbers a file may never have carried. The
 * compression's two are asked for only where the memory is kept.
 */
export function agentBlocked(draft: AgentDraft): string[] {
  const isKept = keepsMemory(draft.memory);

  return [
    draft.name.trim() ? null : AGENT_NAME_DROPPED_LABEL,
    isKept && draft.compressAt === null ? AGENT_COMPRESS_AT_DROPPED_LABEL : null,
    isKept && draft.compressTo === null ? AGENT_COMPRESS_TO_DROPPED_LABEL : null,
    draft.maxCalls === null ? AGENT_MAX_CALLS_DROPPED_LABEL : null,
    draft.temperature === null ? AGENT_TEMPERATURE_DROPPED_LABEL : null,
  ].filter((label): label is string => label !== null);
}
