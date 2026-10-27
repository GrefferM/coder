/** Where a turn's answer goes by the agent's own choice; a turn that chose nothing has none, and its answer goes down every line. */
export interface RouteChoice {
  /** The agents the answer was handed to, in the order they were named; empty where it was only finished. */
  toAgentIds: string[];
  /** The agent ended the branch, which beats any naming. */
  isFinished: boolean;
}
