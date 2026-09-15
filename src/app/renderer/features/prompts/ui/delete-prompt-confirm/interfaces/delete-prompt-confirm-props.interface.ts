import type { Agent, ProjectPrompt } from "../../../../../interfaces";

export interface DeletePromptConfirmProps {
  prompt: ProjectPrompt;
  agents: Agent[];
  onConfirm: () => void;
  onDismiss: () => void;
}
