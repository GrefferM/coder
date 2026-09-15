export interface EditorFootProps {
  /** The agents this prompt stands on — the foot names them, or says there are none. */
  agentNames: string[];
  onCancel: () => void;
  onSave: () => void;
}
