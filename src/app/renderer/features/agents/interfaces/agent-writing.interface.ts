import type { AgentDraft } from "./agent-draft.interface";

/** What is being written about one agent, and everything the write is judged by. */
export interface AgentWriting {
  /** Nothing where no agent is selected — then the tab is the form that makes one. */
  draft: AgentDraft | null;
  saved: AgentDraft | null;
  /** A sphere is being made rather than edited, so the tab is the form whatever else stands. */
  isCreating: boolean;
  isNaming: boolean;
  isDirty: boolean;
  /** The name rule, over agents: another sphere is already called this, so the write is refused. */
  isNameTaken: boolean;
}
