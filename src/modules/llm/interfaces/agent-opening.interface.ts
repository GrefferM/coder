/** What a client is opened with: the model and whatever its provider asked for; a field not asked for is `null`. */
export interface AgentOpening {
  model: string;
  key: string | null;
  address: string | null;
  temperature: number;
  answerTokens: number;
}
