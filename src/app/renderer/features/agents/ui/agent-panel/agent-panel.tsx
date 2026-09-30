import { useState } from "react";
import { AgentForm, AgentHeader, AgentSettings } from "./components";
import type { AgentPanelProps } from "./interfaces";

/** The create form when none is selected, else the agent's settings; the chat stands apart. */
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
   * A step has its own head, so the agent's head stands down while one is open; the tab stays mounted, or leaving a step
   * would hear the standing press and reopen it.
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
