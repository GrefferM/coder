import type { ProjectPrompt } from "../../../interfaces";

/**
 * Whether the prompt the agent names has lost its own file. A promptless agent is a person's
 * choice, not a loss, so nothing at all is nothing broken.
 */
export function isPromptLost(promptId: string | null, prompts: ProjectPrompt[]): boolean {
  return promptId !== null && !prompts.some((prompt) => prompt.id === promptId);
}
