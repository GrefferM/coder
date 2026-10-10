/** What a command line asks: this project's agent, this question. */
export interface AgentAsked {
  /** The project's name, or its folder. */
  project: string;
  /** The agent's name, or its id. */
  agent: string;
  question: string;
}
