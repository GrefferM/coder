import { useEffect, useState } from "react";
import { agentBlocked, agentChanges, agentDraft } from "../../logic";
import { nameTaken } from "../../../../logic";
import { NAME_TAKEN_AGENT_NOTE } from "../../../../constants";
import type { AgentDrafting } from "./interfaces";
import type { OpenProject } from "../../../../interfaces";
import type { AgentDraft } from "../../interfaces";
import type { AgentWrites } from "../use-agent-writes";

/**
 * What the person has written into the selected agent's tab and not saved. The edits are held
 * against the agent they were made on, so leaving that agent discards them — coming back finds the fields as they
 * stand written, which is what «Скасувати» would have done anyway.
 */
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
  // A name is what the person calls this sphere; two spheres with one name name neither, so the write is refused.
  const isNameTaken =
    draft !== null &&
    nameTaken(
      draft.name,
      project.config.agents.filter((agent) => agent.id !== selectedAgentId).map((agent) => agent.name),
    );

  // Leaving an agent discards its unsaved edits; until this runs they are already ignored, being held against its id.
  useEffect(() => setEdits(null), [selectedAgentId]);

  /** Writes the whole draft; nothing unsaved remains. */
  async function save() {
    // A nameless agent is not written — by this path or by the leaving question — and neither is a name already taken.
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
