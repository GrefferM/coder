import type { Agent, ProjectPrompt, UnsavedWork } from "../../../../../interfaces";
import type { PromptFormValues } from "../../../interfaces";

export interface PromptSection {
  chosenPromptId: string | null;
  setChosenPromptId: (promptId: string | null) => void;
  editedPromptId: string | "new" | null;
  editedPrompt: ProjectPrompt | null;
  editedPromptAgentNames: string[];
  form: PromptFormValues | null;
  wasName: string | null;
  /** The name rule, over prompts: the library already has one by this name, so the write is refused. */
  isNameTaken: boolean;
  isDirty: boolean;
  unsaved: UnsavedWork | null;
  armedPrompt: ProjectPrompt | null;
  armedPromptAgents: Agent[];
  edit: (promptId: string | null) => void;
  editForm: (patch: Partial<PromptFormValues>) => void;
  saveForm: () => Promise<void>;
  closeEditor: () => void;
  arm: (promptId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
}
