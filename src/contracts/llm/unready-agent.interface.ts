/** An agent reachable as a tool that cannot run; `notReady` is what the caller's model reads instead of an answer. */
export interface UnreadyAgent {
  agentId: string;
  name: string;
  notReady: string;
}
