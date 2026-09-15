import type { PromptFormValues } from "../../../interfaces";

/** Three exits: `onSave` writes and closes, `onClose` asks, `onCancel` drops the draft. */
export interface PromptEditorProps {
  values: PromptFormValues;
  wasName: string | null;
  /** The name rule, over prompts: another prompt is already called this. */
  isNameTaken: boolean;
  isNew: boolean;
  hasUnsaved: boolean;
  agentNames: string[];
  onChange: (patch: Partial<PromptFormValues>) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  onCancel: () => void;
}
