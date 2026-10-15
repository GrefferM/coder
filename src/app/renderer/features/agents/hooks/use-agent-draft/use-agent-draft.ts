import { useEffect, useState } from "react";
import { agentBlocked, agentChanges, agentDraft } from "../../logic";
import { nameTaken } from "../../../../logic";
import { NAME_TAKEN_AGENT_NOTE } from "../../../../constants";
import type { AgentDrafting } from "./interfaces";
import type { OpenProject } from "../../../../interfaces";
import type { AgentDraft } from "../../interfaces";
import type { AgentWrites } from "../use-agent-writes";

/** The selected agent's unsaved tab edits, held against that agent's id; leaving it discards them. */
export function useAgentDraft(
  project: OpenProject,
  writes: AgentWrites,
  selectedAgentId: string | null,
): AgentDrafting {
  const [edits, setEdits] = useState<{ agentId: string; values: Partial<AgentDraft> } | null>(null);
  const selectedAgent = project.config.agents.find((agent) => agent.id === selectedAgentId) ?? null;
  const ownEdits = edits !== null && edits.agentId === selectedAgentId ? edits.values : null;
  const draft = selectedAgent === null ? null : agentDraft(selectedAgent, ownEdits);
  const saved = selectedAgent === null ? null : agentDraft(selectedAgent, null);
  const changes = saved === null || draft === null ? [] : agentChanges(saved, draft, project.config);
  const isDirty = changes.length > 0;
  // A name already used by another agent is refused.
  const isNameTaken =
    draft !== null &&
    nameTaken(
      draft.name,
      project.config.agents.filter((agent) => agent.id !== selectedAgentId).map((agent) => agent.name),
    );

  // Discards the edits on leaving an agent.
  useEffect(() => setEdits(null), [selectedAgentId]);

  /** Writes the whole draft; nothing unsaved remains. */
  async function save() {
    // Nothing is written while a blocker stands or the name is taken.
    if (selectedAgentId === null || draft === null || agentBlocked(draft).length > 0 || isNameTaken) {
      return;
    }

    await writes.saveAgent(selectedAgentId, draft);
    setEdits(null);
  }

  return {
    draft,
    saved,
    isDirty,
    isNameTaken,
    unsaved:
      !isDirty || draft === null
        ? null
        : {
            name: draft.name,
            changes,
            blocked: agentBlocked(draft),
            blockedNote: isNameTaken ? NAME_TAKEN_AGENT_NOTE : null,
            save,
            discard: () => setEdits(null),
          },
    drawnAgents:
      draft === null
        ? project.config.agents
        : project.config.agents.map((agent) =>
            agent.id === selectedAgentId
              ? {
                  ...agent,
                  ...draft,
                }
              : agent,
          ),
    edit: (patch: Partial<AgentDraft>) =>
      setEdits((previous) => ({
        agentId: selectedAgentId ?? "",
        values: {
          ...(previous !== null && previous.agentId === selectedAgentId ? previous.values : {}),
          ...patch,
        },
      })),
    revert: () => setEdits(null),
    save,
  };
}
