import { anAgent } from "../../../contracts/testing/project-fixtures";
import type { AgentDraft } from "../features/agents";

export * from "../../../contracts/testing/project-fixtures";

/** An agent as the settings tab edits it: everything except its place and identity. */
export function aDraft(patch: Partial<AgentDraft> = {}): AgentDraft {
  const { id: _id, x: _x, y: _y, ...draft } = anAgent();

  return {
    ...draft,
    ...patch,
  };
}
