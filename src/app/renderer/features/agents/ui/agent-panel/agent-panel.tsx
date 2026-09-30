import { useState } from "react";
import { AgentForm, AgentHeader, AgentSettings } from "./components";
import type { AgentPanelProps } from "./interfaces";

/** The create form when none is selected, else the agent's own settings; the chat stands apart. */
export function AgentPanel({ agentId, catalogue, writing, standing, presses, acts }: AgentPanelProps) {
  const [openGrantId, setOpenGrantId] = useState<string | null>(null);

  const { draft } = writing;

  if (writing.isCreating || draft === null) {
    return (
      <AgentForm
        models={catalogue.models}
        agents={catalogue.agents}
        onCreate={acts.onCreate}
        onCancel={acts.onCancel}
      />
    );
  }

  const settings = (
    <AgentSettings
      agentId={agentId}
      draft={draft}
      catalogue={catalogue}
      writing={writing}
      standing={standing}
      presses={presses}
      acts={acts}
      openGrantId={openGrantId}
      onOpenGrantChange={setOpenGrantId}
    />
  );

  /**
   * A step of the tab wears a head of its own, so the agent's head stands down while one is open — but the
   * tab itself stays exactly where it was. Returning the settings bare instead took them out of this box and put
   * them back in, and React tears down what changes place: the way out of a step opened that step again, because
   * the tab was born anew and heard the standing press as a fresh one. The head goes; the tab stays.
   */
  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      {openGrantId === null && (
        <AgentHeader
          name={draft.name}
          color={draft.color}
          isActive={draft.isActive}
          state={standing.state}
          startedAt={standing.startedAt}
        />
      )}
      {settings}
    </div>
  );
}
