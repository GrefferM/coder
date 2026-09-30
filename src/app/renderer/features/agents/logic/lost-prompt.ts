import type { ProjectPrompt } from "../../../interfaces";

/** Whether the agent's prompt has lost its file; no prompt is not lost. */
export function isPromptLost(promptId: string | null, prompts: ProjectPrompt[]): boolean {
  return promptId !== null && !prompts.some((prompt) => prompt.id === promptId);
}
