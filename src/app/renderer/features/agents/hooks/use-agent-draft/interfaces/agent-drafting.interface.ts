import type { Agent, UnsavedWork } from "../../../../../interfaces";
import type { AgentDraft } from "../../../interfaces";

/** The selected agent's unsaved settings against the saved ones. */
export interface AgentDrafting {
  /** The selected agent with its unsaved edits laid over it; null when none is selected. */
  draft: AgentDraft | null;
  /** The same agent as saved. */
  saved: AgentDraft | null;
  isDirty: boolean;
  /** Whether another agent already has the name. */
  isNameTaken: boolean;
  /** The page's unsaved-work question, when this panel holds the draft. */
  unsaved: UnsavedWork | null;
  /** The project's agents for the canvas, the selected one with its unsaved edits. */
  drawnAgents: Agent[];
  edit: (patch: Partial<AgentDraft>) => void;
  /** Puts every field back to the saved value, keeping the agent selected. */
  revert: () => void;
  save: () => Promise<void>;
}
