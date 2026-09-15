import type { Agent, UnsavedWork } from "../../../../../interfaces";
import type { AgentDraft } from "../../../interfaces";

/** The selected agent's unwritten settings, and what they are against what is written. */
export interface AgentDrafting {
  /** The selected agent with its unwritten edits laid over it; null while nobody is selected. */
  draft: AgentDraft | null;
  /** The same agent as it stands written, so every field can say what it was. */
  saved: AgentDraft | null;
  isDirty: boolean;
  /** The name rule, over agents: the name another sphere already has, so the tab can say so and refuse the write. */
  isNameTaken: boolean;
  /** The page's one unsaved-work question, when this panel holds the draft. */
  unsaved: UnsavedWork | null;
  /** What the canvas draws — the project's agents, the selected one wearing its unwritten edits. */
  drawnAgents: Agent[];
  edit: (patch: Partial<AgentDraft>) => void;
  /** Puts every field back to what is written, without moving off the agent. */
  revert: () => void;
  save: () => Promise<void>;
}
