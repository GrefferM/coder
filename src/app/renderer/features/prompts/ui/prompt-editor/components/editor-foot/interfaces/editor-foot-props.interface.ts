export interface EditorFootProps {
  /** The agents on this prompt; the foot names them or says there are none. */
  agentNames: string[];
  onCancel: () => void;
  onSave: () => void;
}
