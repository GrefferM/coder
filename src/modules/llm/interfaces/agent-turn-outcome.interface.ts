/** What a sub-agent's turn came to: its answer, and whether it could not run to one. */
export interface AgentTurnOutcome {
  text: string;
  isFailed: boolean;
}
