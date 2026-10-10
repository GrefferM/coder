/** What a client is opened with: the model and whatever its provider asked for; a field not asked for is `null`. */
export interface AgentOpening {
  model: string;
  key: string | null;
  address: string | null;
  temperature: number;
  answerTokens: number;
  /** The conversation the call belongs to, the same for every call of it; a gateway may route and cache by it. */
  session: string;
}
