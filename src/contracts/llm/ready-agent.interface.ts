import type { AgentRun } from "./agent-run.interface";

/** An agent reachable as a tool that can run, with the run its call opens. */
export interface ReadyAgent extends AgentRun {
  agentId: string;
  name: string;
  notReady: null;
}
