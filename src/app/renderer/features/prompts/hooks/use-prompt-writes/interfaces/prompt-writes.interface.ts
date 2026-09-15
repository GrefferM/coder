/** A prompt written in place or created, and a prompt taken off its agents. */
export interface PromptWrites {
  savePrompt: (promptId: string | null, name: string, text: string) => Promise<string>;
  deletePrompt: (promptId: string) => Promise<void>;
}
