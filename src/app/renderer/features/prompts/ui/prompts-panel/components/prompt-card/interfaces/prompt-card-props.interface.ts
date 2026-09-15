import type { ProjectPrompt } from "../../../../../../../interfaces";

export interface PromptCardProps {
  prompt: ProjectPrompt;
  agentCount: number;
  isChosen: boolean;
  onChoose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
