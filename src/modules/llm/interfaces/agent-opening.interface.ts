/**
 * What a client is opened with: the model to call and whatever its provider asked for. A field the provider did
 * not ask for stands as `null` — nothing is invented for it, and the client reads only what it declared it needs.
 */
export interface AgentOpening {
  model: string;
  key: string | null;
  address: string | null;
  temperature: number;
  answerTokens: number;
}
