/** Writing or creating a prompt, and taking a prompt off its agents. */
export interface PromptWrites {
  savePrompt: (promptId: string | null, name: string, text: string) => Promise<string>;
  deletePrompt: (promptId: string) => Promise<void>;
}
