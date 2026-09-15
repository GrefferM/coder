import type { AgentDraft } from "./agent-draft.interface";

/** Every act of an agent's tab: making one, writing one, taking a write back, and letting one go. */
export interface AgentPanelActs {
  onCreate: (name: string, modelId: string) => Promise<void>;
  onCancel: () => void;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
  onRevert: () => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
}
