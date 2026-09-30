import type { AgentDraft } from "./agent-draft.interface";

/** Every act of an agent's tab: make, write, take back, let go. */
export interface AgentPanelActs {
  onCreate: (name: string, modelId: string) => Promise<void>;
  onCancel: () => void;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
  onRevert: () => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
}
