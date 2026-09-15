import type { Agent, ProjectPrompt } from "../../../../../interfaces";

export interface PromptsPanelProps {
  prompts: ProjectPrompt[];
  agents: Agent[];
  chosenPromptId: string | null;
  onChosenPromptIdChange: (promptId: string | null) => void;
  onEditPrompt: (promptId: string | null) => void;
  onDeletePrompt: (promptId: string) => void;
}
