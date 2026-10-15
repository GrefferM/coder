/** A key or address the provider does not ask for is `null`. */
export interface AgentOpening {
  model: string;
  key: string | null;
  address: string | null;
  /** `undefined` where the person set none (zero): the field is then not sent, and the model keeps its own. */
  temperature: number | undefined;
  answerTokens: number;
  /** The conversation the call belongs to, the same for every call of it; a gateway may route and cache by it. */
  session: string;
}
