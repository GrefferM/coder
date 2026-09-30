import type { AgentDraft } from "./agent-draft.interface";

/** What is being written about one agent, and what the write is judged by. */
export interface AgentWriting {
  /** Null when no agent is selected; the tab is then the creation form. */
  draft: AgentDraft | null;
  saved: AgentDraft | null;
  /** A sphere is being made, not edited, so the tab is the creation form. */
  isCreating: boolean;
  isNaming: boolean;
  isDirty: boolean;
  /** Another agent already has this name, so the write is refused. */
  isNameTaken: boolean;
}
