/** What a walk from a command line came to. */
export interface AgentAnswered {
  /** The whole conversation as plain text, as the export writes it. */
  text: string;
  /** Whether the walk ended other than whole: a turn fell, never began or did not go. */
  hasFallen: boolean;
}
