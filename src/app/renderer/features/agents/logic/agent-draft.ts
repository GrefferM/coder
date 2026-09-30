import type { Agent } from "../../../interfaces";
import type { AgentDraft } from "../interfaces";

/** The saved agent as the settings tab holds it: all but id and position, plus edits. */
export function agentDraft(agent: Agent, edits: Partial<AgentDraft> | null): AgentDraft {
  const { id: _id, x: _x, y: _y, ...saved } = agent;

  return {
    ...saved,
    ...edits,
  };
}
