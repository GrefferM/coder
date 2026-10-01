/** What a turn carries, measured against the model's ceiling. */
export interface TurnParts {
  systemPrompt: string | null;
  asked: string;
  /** Characters of memory ahead of what was asked. */
  memoryLength: number;
  ceiling: number;
}
