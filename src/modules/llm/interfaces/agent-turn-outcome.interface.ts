/** A sub-agent's turn; when it could not run to an answer, `isFailed` and `text` says why. */
export interface AgentTurnOutcome {
  text: string;
  isFailed: boolean;
}
